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

impl Worker for FileHashWorker {
  fn spawn(self, _: &AppHandle, db: Db) {
    let max_batch_size = Self::get_batch_size(10);

    let span = tracing::info_span!("file_hash_worker", max_batch_size = max_batch_size);
    let _enter = span.enter();

    tracing::info!("File hash worker started");

    tauri::async_runtime::spawn(
      async move {
        loop {
          let t0 = Instant::now();

          let files =
            match list_image_files_by_status(&db, max_batch_size, ProcessStatus::Pending).await {
              Ok(files) => files,
              Err(e) => {
                tracing::error!(error = ?e, "Failed to fetch files for hashing");
                Self::wait_for(10).await;
                continue;
              }
            };

          if files.is_empty() {
            tracing::debug!("No pending images for hashing");
            Self::wait_for(20).await;
            continue;
          }

          tracing::info!(files = files.len(), "Hash batch fetched");

          let result: Vec<(ImageFile, String)> = tauri::async_runtime::spawn_blocking(move || {
            files
              .into_par_iter()
              .filter_map(|mut file| {
                if let Ok(file_hash) = hashing::generate_file_hash(&file.file_path, file.file_size)
                {
                  file.mark_hashed();
                  Some((file, file_hash))
                } else {
                  None
                }
              })
              .collect()
          })
          .await
          .unwrap();

          if let Err(e) = bulk_update_image_hash(&db, &result).await {
            tracing::error!(error = ?e, result = result.len(), "Failed to persist image hash updates");
            Self::wait_for(5).await;
          } else {
            tracing::info!(
              duration_secs = t0.elapsed().as_secs_f32(),
              updated = result.len(),
              "Hash batch completed"
            );
          }
        }
      }
      .instrument(span.clone()),
    );
  }
}
