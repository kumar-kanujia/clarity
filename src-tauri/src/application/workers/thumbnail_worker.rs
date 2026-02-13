use crate::{
  application::workers::Worker,
  domain::{imagefile::ProcessStatus, imagemetadata::ImageMetadata},
  error::AppError,
  infrastructure::{
    fs::ops,
    processing::metadata,
    repo::image_repo::{bulk_update_image_metadata, list_image_paths_by_status},
  },
  setup::state::Db,
};

use std::{
  path::{Path, PathBuf},
  time::Instant,
};

use rayon::iter::{IntoParallelIterator, ParallelIterator};
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

  fn work(files_data: Vec<(i64, String)>, thumbnail_target: &Path) -> Vec<(i64, ImageMetadata)> {
    files_data
      .into_par_iter()
      .filter_map(|(seq_id, file_path)| {
        match metadata::create_image_metadata(&file_path, thumbnail_target) {
          Ok(image_metadata) => Some((seq_id, image_metadata)),
          Err(err) => {
            tracing::error!(
              error = ?err,
              %file_path,
              "Failed to generate image metadata"
            );
            None
          }
        }
      })
      .collect()
  }
}

impl Worker for ThumbnailWorker {
  fn spawn(self, app: &AppHandle, db: Db) {
    let max_batch_size = Self::get_batch_size(2);

    let span = tracing::info_span!("thumbnail_worker", %max_batch_size);
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
          let t_fetch = Instant::now();

          let thumbnail_target = thumbnail_target.clone();

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
                Self::wait_for(Self::IDEAL_WAIT_TIME).await;
                continue;
              }
            };

          let fetch_ms = t_fetch.elapsed().as_millis();

          tracing::info!(files = files_data.len(), "Thumbnail batch fetched");

          let t_process = Instant::now();

          let updated_files = match tauri::async_runtime::spawn_blocking(move || {
            Self::work(files_data, &thumbnail_target)
          })
          .await
          {
            Ok(f) => f,
            Err(e) => {
              tracing::error!(error = ?e, "Thumbnail worker task panicked");
              Self::wait_for(Self::IDEAL_WAIT_TIME).await;
              continue;
            }
          };

          let process_ms = t_process.elapsed().as_millis();
          if !updated_files.is_empty() {
            let t_update = Instant::now();
            if let Err(e) = bulk_update_image_metadata(&db, &updated_files).await {
              tracing::error!(
                  error = ?e,
                  updated = updated_files.len(),
                  "Failed to persist thumbnail metadata updates"
              );
              Self::wait_for(Self::IDEAL_WAIT_TIME).await;
            } else {
              let update_ms = t_update.elapsed().as_millis();

              tracing::info!(
                "Batch Done | Count: {} | Fetch: {}ms | CPU: {}ms | DB Write: {}ms",
                updated_files.len(),
                fetch_ms,
                process_ms,
                update_ms
              );
            }
          }
        }
      }
      .instrument(span.clone()),
    );
  }
}
