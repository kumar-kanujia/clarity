use crate::{
  application::{services::file_hash_service::FileHashService, workers::Worker},
  domain::image::Image,
  infrastructure::{
    models::image_model::ImageStatus,
    repo::image_repo::{list_images_by_status, update_images_hash},
  },
  setup::state::Db,
};

use std::time::Instant;
use tauri::AppHandle;
use tokio_util::sync::CancellationToken;
use tracing::Instrument;

#[derive(Debug, Default)]
pub struct FileHashWorker;

impl Worker for FileHashWorker {
  fn spawn(self, _: &AppHandle, db: Db, shutdown: CancellationToken) {
    let max_batch_size = Self::get_batch_size(4);
    let span = tracing::info_span!("file_hash_worker", %max_batch_size);

    tauri::async_runtime::spawn(
      async move {
        loop {
          let batch_span = tracing::info_span!("hash_batch");

          let _enter = batch_span.enter();

          let start_time = Instant::now();

          let mut files: Vec<Image> =
            match list_images_by_status(&db, max_batch_size, ImageStatus::Pending).await {
              Ok(f) if f.is_empty() => {
                if Self::sleep_or_shutdown(Self::IDEAL_WAIT_TIME, &shutdown).await {
                  tracing::info!("File hash worker shutting down");
                  break;
                }
                continue;
              }
              Ok(f) => f.into_iter().map(Image::from).collect(),
              Err(e) => {
                tracing::error!(error = ?e, "DB Fetch failed");
                if Self::sleep_or_shutdown(Self::IDEAL_HOLD_TIME, &shutdown).await {
                  tracing::info!("File hash worker shutting down");
                  break;
                }
                continue;
              }
            };

          tracing::info!(batch_size = files.len(), "Hash batch fetched");

          files = match tauri::async_runtime::spawn_blocking(move || {
            FileHashService::process_batch(&mut files);
            files
          })
          .await
          {
            Ok(res) => res,
            Err(e) => {
              tracing::error!(error = ?e, "File hash worker task panicked");
              if Self::sleep_or_shutdown(Self::IDEAL_HOLD_TIME, &shutdown).await {
                tracing::info!("File hash worker shutting down");
                break;
              }
              continue;
            }
          };

          match update_images_hash(&db, &files).await {
            Err(e) => {
              tracing::error!(error = ?e, "Bulk update failed");
              if Self::sleep_or_shutdown(Self::IDEAL_HOLD_TIME, &shutdown).await {
                tracing::info!("File hash worker shutting down");
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
      .instrument(span),
    );
  }
}
