use crate::{
  application::{services::thumbnail_service::ThumbnailService, workers::Worker},
  domain::image::Image,
  infrastructure::repo::image_repo::{list_images_by_status, update_images_metadata},
  setup::state::Db,
};

use std::time::Instant;
use tauri::AppHandle;
use tokio_util::sync::CancellationToken;
use tracing::Instrument;

#[derive(Debug, Default, Clone)]
pub struct ThumbnailWorker;

impl Worker for ThumbnailWorker {
  fn spawn(self, app: &AppHandle, db: Db, shutdown: CancellationToken) {
    let max_batch_size = Self::get_batch_size(2);
    let span = tracing::info_span!("thumbnail_worker", %max_batch_size);
    let _enter = span.enter();

    let thumbnail_target = match ThumbnailService::get_thumbnail_target(app) {
      Ok(path) => path,
      Err(e) => {
        tracing::error!(error = ?e, "Thumbnail worker failed to lock cache directory");
        return;
      }
    };

    tauri::async_runtime::spawn(
      async move {
        loop {
          let batch_span = tracing::info_span!("thumbnail_worker_batch");

          let _enter = batch_span.enter();

          let start_time = Instant::now();

          let thumbnail_target = thumbnail_target.clone();

          let mut files: Vec<Image> = match list_images_by_status(
            &db,
            max_batch_size,
            crate::infrastructure::models::image_model::ImageStatus::Hashed,
          )
          .await
          {
            Ok(f) if f.is_empty() => {
              if Self::sleep_or_shutdown(Self::IDEAL_WAIT_TIME, &shutdown).await {
                tracing::info!("Thumbnail worker shutting down");
                break;
              }
              continue;
            }
            Ok(f) => f.into_iter().map(Image::from).collect(),
            Err(e) => {
              tracing::error!(error = ?e, "DB Fetch failed");
              if Self::sleep_or_shutdown(Self::IDEAL_HOLD_TIME, &shutdown).await {
                tracing::info!("Thumbnail worker shutting down");
                break;
              }
              continue;
            }
          };

          tracing::info!(batch_size = files.len(), "Hash batch fetched");

          files = match tauri::async_runtime::spawn_blocking(move || {
            ThumbnailService::process_batch(&mut files, &thumbnail_target);
            files
          })
          .await
          {
            Ok(res) => res,
            Err(e) => {
              tracing::error!(error = ?e, "Thumbnail worker task panicked");
              if Self::sleep_or_shutdown(Self::IDEAL_HOLD_TIME, &shutdown).await {
                tracing::info!("Thumbnail worker shutting down");
                break;
              }
              continue;
            }
          };

          match update_images_metadata(&db, &files).await {
            Err(e) => {
              tracing::error!(error = ?e, "Bulk update failed");
              if Self::sleep_or_shutdown(Self::IDEAL_HOLD_TIME, &shutdown).await {
                tracing::info!("Thumbnail worker shutting down");
                break;
              }
            }
            Ok(file_updated) => {
              tracing::info!(
                file_processed = files.len(),
                file_updated = file_updated,
                elapsed_ms = start_time.elapsed().as_millis(),
                "Batch processed successfully"
              );
            }
          }
        }
      }
      .instrument(span.clone()),
    );
  }
}
