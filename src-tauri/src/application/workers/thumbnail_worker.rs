use crate::{
  application::workers::Worker,
  domain::imagefile::ProcessStatus,
  error::AppError,
  infrastructure::{
    fs::ops,
    processing::metadata::create_image_metadata,
    repo::image_repo::{bulk_update_image_metadata, list_image_paths_by_status},
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
    let cache_dir = app.path().app_data_dir().map_err(AppError::Internal)?;
    let target_dir = cache_dir.join("org.clarity").join(".thumbnails");
    ops::ensure_dir(&target_dir)?;
    Ok(target_dir)
  }
}

impl Worker for ThumbnailWorker {
  fn spawn(self, app: &AppHandle, db: Db) {
    let max_batch_size = Self::get_batch_size(2);

    let span = tracing::info_span!("thumbnail_worker", max_batch_size = max_batch_size);
    let _enter = span.enter();

    let thumbnail_target = match Self::get_thumbnail_target(app) {
      Ok(path) => path,
      Err(e) => {
        tracing::error!(error = ?e, "Thumbnail worker failed to lock cache directory");
        return;
      }
    };

    tauri::async_runtime::spawn(
      async move {
        loop {
          let start_time = Instant::now();

          let files_data =
            match list_image_paths_by_status(&db, max_batch_size, ProcessStatus::Hashed).await {
              Ok(f) if f.is_empty() => {
                tracing::debug!("No pending thumbnails");
                Self::wait_for(Self::IDEAL_WAIT_TIME).await;
                continue;
              }
              Ok(f) => f,
              Err(e) => {
                tracing::error!(error = ?e, "DB Fetch failed");
                Self::wait_for(10).await;
                continue;
              }
            };

          tracing::info!(files = files_data.len(), "Thumbnail batch fetched");

          let mut tasks = Vec::new();

          for (seq_id, file_path) in files_data {
            let target_clone = thumbnail_target.clone();
            let task = tauri::async_runtime::spawn_blocking(move || {
              let path = PathBuf::from(&file_path);

              let result = create_image_metadata(&path, &target_clone);
              (seq_id, file_path, result)
            });

            tasks.push(task);
          }

          let mut updated_files = Vec::with_capacity(tasks.len());

          for task in tasks {
            match task.await {
              Ok((seq_id, file_path, metadata_result)) => match metadata_result {
                Ok(image_metadata) => {
                  updated_files.push((seq_id, image_metadata));
                }
                Err(err) => {
                  tracing::error!(
                      error = ?err,
                      path = %file_path,
                      "Failed to generate image metadata"
                  );
                }
              },
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
            duration_secs = start_time.elapsed().as_secs_f32(),
            updated = updated_files.len(),
            "Thumbnail batch completed"
          );
        }
      }
      .instrument(span.clone()),
    );
  }
}
