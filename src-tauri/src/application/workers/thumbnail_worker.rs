use crate::{
  application::workers::Worker,
  domain::imagefile::ProcessStatus,
  error::AppError,
  infrastructure::{
    fs::ops,
    media::metadata::create_image_metadata,
    repo::image_repo::{bulk_update_image_metadata, list_image_files_by_status},
  },
  setup::state::Db,
};

use std::{path::PathBuf, time::Instant};

use tauri::{AppHandle, Manager};
use tracing::Instrument;

#[derive(Debug, Default)]
pub struct ThumbnailWorker;

impl ThumbnailWorker {
  fn get_thumbnail_target(app: &AppHandle) -> Result<PathBuf, AppError> {
    let cache_dir = app.path().app_data_dir().map_err(|err| {
      tracing::error!(error = ?err, "Failed to resolve app data directory");
      AppError::InternalError("Failed to resolve app data directory".into())
    })?;

    let target_dir = cache_dir.join("org.clarity").join(".thumbnails");

    ops::ensure_dir(&target_dir).map_err(|e| {
      tracing::error!(error = ?e, "Failed to ensure thumbnail directory is present");
      AppError::from(e)
    })?;

    Ok(target_dir)
  }
}

impl Worker for ThumbnailWorker {
  fn spawn(self, app: &AppHandle, db: Db) {
    let max_batch_size = Self::get_batch_size();

    let span = tracing::info_span!("thumbnail_worker", max_batch_size = max_batch_size);
    let _enter = span.enter();

    let thumbnail_target = match Self::get_thumbnail_target(app) {
      Ok(path) => path,
      Err(e) => {
        tracing::error!(error = ?e, "Thumbnail worker failed to initialize");
        return;
      }
    };

    tauri::async_runtime::spawn(
      async move {
        loop {
          let t0 = Instant::now();

          let files =
            match list_image_files_by_status(&db, max_batch_size, ProcessStatus::Hashed).await {
              Ok(files) => files,
              Err(e) => {
                tracing::error!(error = ?e, "Failed to fetch files for thumbnail generation");
                Self::wait_for(10).await;
                continue;
              }
            };

          if files.is_empty() {
            tracing::debug!("No pending thumbnails");
            Self::wait_for(20).await;
            continue;
          }

          tracing::info!(files = files.len(), "Thumbnail batch fetched");

          let mut tasks = Vec::new();

          for file in files {
            let target_clone = thumbnail_target.clone();
            let task = tauri::async_runtime::spawn_blocking(move || {
              let file_path = PathBuf::from(&file.file_path);

              let result = create_image_metadata(&file_path, &target_clone);
              (file, result)
            });

            tasks.push(task);
          }

          let mut updated_files = Vec::with_capacity(tasks.len());

          for task in tasks {
            match task.await {
              Ok((mut file, metadata_result)) => {
                match metadata_result {
                  Ok(image_metadata) => {
                    file.update_metadata(image_metadata);
                  }
                  Err(err) => {
                    tracing::error!(
                        error = ?err,
                        path = %file.file_path,
                        "Thumbnail metadata generation failed"
                    );
                    file.mark_error();
                  }
                }
                updated_files.push(file);
              }
              Err(join_err) => {
                tracing::error!(
                    error = ?join_err,
                    "Thumbnail worker task panicked"
                );
              }
            }
          }

          if let Err(e) = bulk_update_image_metadata(&db, &updated_files).await {
            tracing::error!(
                error = ?e,
                updated = updated_files.len(),
                "Failed to persist thumbnail metadata updates"
            );
            Self::wait_for(5).await;
          }

          tracing::info!(
            duration_secs = t0.elapsed().as_secs_f32(),
            updated = updated_files.len(),
            "Thumbnail batch completed"
          );
        }
      }
      .instrument(span.clone()),
    );
  }
}
