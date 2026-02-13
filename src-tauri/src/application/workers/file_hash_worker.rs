use std::time::Instant;

use crate::{
  application::workers::Worker,
  domain::imagefile::{ImageFile, ProcessStatus},
  infrastructure::{
    processing::hashing,
    repo::image_repo::{bulk_update_image_hash, list_image_files_by_status},
  },
  setup::state::Db,
};

use rayon::iter::{IntoParallelIterator, ParallelIterator};
use tauri::AppHandle;
use tracing::Instrument;

#[derive(Debug, Default)]
pub struct FileHashWorker;

impl FileHashWorker {
  fn work(files: Vec<ImageFile>) -> Vec<(i64, String)> {
    files
      .into_par_iter()
      .filter_map(
        |file| match hashing::generate_file_hash(&file.file_path, file.file_size) {
          Ok(file_hash) => Some((file.seq_id, file_hash)),
          Err(e) => {
            tracing::error!(path = %file.file_path, error = %e, "Hash failure");
            None
          }
        },
      )
      .collect()
  }
}

impl Worker for FileHashWorker {
  fn spawn(self, _: &AppHandle, db: Db) {
    let max_batch_size = Self::get_batch_size(10);
    let span = tracing::info_span!("file_hash_worker", %max_batch_size);

    tauri::async_runtime::spawn(
      async move {
        tracing::info!("File hash worker started");
        loop {
          let start_time = Instant::now();

          let files =
            match list_image_files_by_status(&db, max_batch_size, ProcessStatus::Pending).await {
              Ok(f) if f.is_empty() => {
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

          tracing::info!(files = files.len(), "Hash batch fetched");

          let hashed_results =
            match tauri::async_runtime::spawn_blocking(move || Self::work(files)).await {
              Ok(res) => res,
              Err(e) => {
                tracing::error!(error = ?e, "File hash worker task panicked");
                Self::wait_for(Self::IDEAL_WAIT_TIME).await;
                continue;
              }
            };

          if !hashed_results.is_empty() {
            if let Err(e) = bulk_update_image_hash(&db, &hashed_results).await {
              tracing::error!(error = ?e, "Bulk update failed");
              Self::wait_for(Self::IDEAL_WAIT_TIME).await;
            } else {
              tracing::info!(
                count = hashed_results.len(),
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
