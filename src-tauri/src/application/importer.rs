use crate::domain::dto::{ImportCounters, ImportSummary, ProcessStatus};
use crate::infrastructure::fs::scanner;
use crate::infrastructure::media::metadata::generate_file_metadata;
use crate::infrastructure::repo::image_repo;
use crate::state::Db;

use futures::stream::{self, StreamExt};
use std::io::Error;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::sync::atomic::Ordering;
use std::time::Instant;

async fn process_image(db: &Db, file: &Path) -> Result<ProcessStatus, Error> {
  let file_meta = generate_file_metadata(file)
    .map_err(|err| Error::other(format!("Failed to generate metadata: {}", err)))?;

  let exists = image_repo::check_is_file_exists(db, &file_meta.file_path)
    .await
    .map_err(|e| Error::other(format!("DB Check failed: {}", e)))?;

  if exists {
    return Ok(ProcessStatus::Skipped);
  }

  image_repo::save_image_file(db, &file_meta.into())
    .await
    .map_err(|e| Error::other(format!("DB Insert failed: {}", e)))?;

  Ok(ProcessStatus::Processed)
}

/// Process a list of image files in parallel
async fn process_images_async(db: &Db, files: Vec<PathBuf>) -> Result<ImportSummary, Error> {
  let counters = Arc::new(ImportCounters::default());

  stream::iter(files)
    .for_each_concurrent(2, |path| {
      let counters = counters.clone();
      let db = db.clone();

      async move {
        counters.scanned.fetch_add(1, Ordering::Relaxed);
        match process_image(&db, &path).await {
          Ok(ProcessStatus::Processed) => {
            counters.imported.fetch_add(1, Ordering::Relaxed);
          }
          Ok(ProcessStatus::Skipped) => {
            counters.skipped.fetch_add(1, Ordering::Relaxed);
            log::info!("Skipped {:?}", path);
          }
          Err(err) => {
            counters.failed.fetch_add(1, Ordering::Relaxed);
            log::error!("Failed to process {:?}: {}", path, err);
          }
        }
      }
    })
    .await;
  Ok(counters.into())
}

pub async fn scan_and_process_images(db: &Db, paths: Vec<PathBuf>) -> Result<ImportSummary, Error> {
  let t0 = Instant::now();
  log::info!("Scanning and processing images started");

  let mut all_images = Vec::new();
  let mut total_scanned = 0;
  let mut set = tokio::task::JoinSet::new();

  for path in paths {
    set.spawn_blocking(move || scanner::perform_file_scan(path));
  }

  while let Some(res) = set.join_next().await {
    let (images, count) = res.map_err(|_| Error::other("Something went wrong!"))?;
    all_images.extend(images);
    total_scanned += count;
  }

  let mut summary: ImportSummary = process_images_async(db, all_images).await?;

  let t1 = Instant::now();

  summary.total = total_scanned;

  log::info!("Scanning and processing images completed in {:?}", t1 - t0);
  log::info!(
    "Total: {:?} Scanned: {:?} Imported: {:?} Skipped: {:?} Failed: {:?}",
    summary.total,
    summary.scanned,
    summary.imported,
    summary.skipped,
    summary.failed
  );

  Ok(summary)
}
