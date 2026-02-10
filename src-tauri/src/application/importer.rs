use crate::domain::dto::{ImportCounters, ImportSummary, ProcessStatus};
use crate::infrastructure::fs::scanner;
use crate::infrastructure::repo::image_repo;
use crate::state::Db;

use futures::stream::{self, StreamExt};
use std::io::Error;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::sync::atomic::Ordering;

async fn process_image(db: &Db, file: &Path) -> Result<ProcessStatus, Error> {
  let path_str = file
    .to_str()
    .ok_or_else(|| Error::other("Path is not valid UTF-8"))?;

  let exists = image_repo::check_is_file_exists(db, path_str)
    .await
    .map_err(|e| Error::other(format!("DB Check failed: {}", e)))?;

  if exists {
    return Ok(ProcessStatus::Skipped);
  }

  let image_file = scanner::build_image_file_with_metadata(file).unwrap_or_else(|e| {
    eprintln!("Metadata extraction failed: {}", e);
    scanner::build_image_file_witout_metadata(file)
  });

  image_repo::save_image_file(db, &image_file)
    .await
    .map_err(|e| Error::other(format!("DB Insert failed: {}", e)))?;

  Ok(ProcessStatus::Processed)
}

/// Process a list of image files in parallel
async fn process_images_async(db: &Db, files: Vec<PathBuf>) -> Result<ImportSummary, Error> {
  let counters = Arc::new(ImportCounters::default());

  stream::iter(files)
    .for_each_concurrent(10, |path| {
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
          }
          Err(err) => {
            counters.failed.fetch_add(1, Ordering::Relaxed);
            eprintln!("Failed to process {:?}: {}", path, err);
          }
        }
      }
    })
    .await;
  Ok(counters.into())
}

pub async fn scan_and_process_images(db: &Db, paths: Vec<PathBuf>) -> Result<ImportSummary, Error> {
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
  summary.total = total_scanned;

  Ok(summary)
}
