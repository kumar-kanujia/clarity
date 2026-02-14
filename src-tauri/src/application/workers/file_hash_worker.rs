use std::time::Instant;

use crate::{
  application::workers::Worker,
  domain::image::Image,
  infrastructure::{
    models::image_model::ImageStatus,
    processing::hashing,
    repo::image_repo::{list_images_by_status, update_images_hash},
  },
  setup::state::Db,
};

use rayon::iter::{IntoParallelRefMutIterator, ParallelIterator};
use tauri::AppHandle;
use tracing::Instrument;

#[derive(Debug, Default)]
pub struct FileHashWorker;

impl FileHashWorker {
  fn work(files: &mut [Image]) {
    files.par_iter_mut().for_each(|image| {
      match hashing::generate_file_hash(&image.path, image.size_bytes) {
        Ok(content_hash) => {
          image.update_hash(content_hash);
        }
        Err(e) => {
          tracing::error!(path = %image.path, id = image.id, error = %e, "Hash failure for: ");
          image.mark_hash_error(e.to_string());
        }
      }
    });
  }
}

impl Worker for FileHashWorker {
  fn spawn(self, _: &AppHandle, db: Db) {
    let max_batch_size = Self::get_batch_size(4);
    let span = tracing::info_span!("file_hash_worker", %max_batch_size);

    tauri::async_runtime::spawn(
      async move {
        tracing::info!("File hash worker started");
        loop {
          let start_time = Instant::now();

          let mut files: Vec<Image> =
            match list_images_by_status(&db, max_batch_size, ImageStatus::Pending).await {
              Ok(f) if f.is_empty() => {
                Self::wait_for(Self::IDEAL_WAIT_TIME).await;
                continue;
              }
              Ok(f) => f,
              Err(e) => {
                tracing::error!(error = ?e, "DB Fetch failed");
                Self::wait_for(Self::IDEAL_HOLD_TIME).await;
                continue;
              }
            }
            .into_iter()
            .map(Image::from)
            .collect();

          tracing::info!(files = files.len(), "Hash batch fetched");

          let hashed_results: Vec<Image> = match tauri::async_runtime::spawn_blocking(move || {
            Self::work(&mut files);
            files
          })
          .await
          {
            Ok(res) => res,
            Err(e) => {
              tracing::error!(error = ?e, "File hash worker task panicked");
              Self::wait_for(Self::IDEAL_HOLD_TIME).await;
              continue;
            }
          };

          if !hashed_results.is_empty() {
            match update_images_hash(&db, &hashed_results).await {
              Err(e) => {
                tracing::error!(error = ?e, "Bulk update failed");
                Self::wait_for(Self::IDEAL_HOLD_TIME).await;
              }
              Ok(file_updated) => {
                tracing::info!(
                  file_processed = hashed_results.len(),
                  file_updated = file_updated,
                  elapsed_ms = start_time.elapsed().as_millis(),
                  "Batch processed successfully"
                );
              }
            }
          }
        }
      }
      .instrument(span),
    );
  }
}
