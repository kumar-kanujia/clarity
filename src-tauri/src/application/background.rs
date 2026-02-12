use crate::{
  error::AppError,
  infrastructure::{
    fs::ops,
    media::metadata::create_image_metadata,
    repo::image_repo::{bulk_update_image_metadata, list_pending_process_image_file},
  },
  state::Db,
};

use std::{
  cmp,
  path::PathBuf,
  time::{Duration, Instant},
};

use tauri::{AppHandle, Manager};

pub struct ThumbnailWorker;

impl ThumbnailWorker {
  fn get_batch_size() -> i64 {
    cmp::max(5, num_cpus::get() * 2) as i64
  }

  async fn wait_for(time: u64) {
    tokio::time::sleep(Duration::from_secs(time)).await;
  }

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

  pub fn spawn(app: &AppHandle, db: Db) {
    let batch_size = Self::get_batch_size();

    let span = tracing::info_span!("thumbnail_worker", batch_size = batch_size);
    let _enter = span.enter();

    let thumbnail_target = match Self::get_thumbnail_target(app) {
      Ok(path) => path,
      Err(e) => {
        tracing::error!(error = ?e, "Thumbnail worker failed to initialize");
        return;
      }
    };

    tauri::async_runtime::spawn(async move {
      loop {
        let t0 = Instant::now();

        let files = match list_pending_process_image_file(&db, batch_size).await {
          Ok(files) => files,
          Err(e) => {
            tracing::error!(error = ?e, "Failed to fetch pending images");
            Self::wait_for(10).await;
            continue;
          }
        };

        if files.is_empty() {
          tracing::debug!("No pending thumbnails");
          Self::wait_for(20).await;
          continue;
        }

        tracing::info!(
          batch_size = batch_size,
          files = files.len(),
          "Thumbnail batch fetched"
        );

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
    });
  }
}
