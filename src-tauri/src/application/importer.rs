use crate::domain::dto::ImportSummary;
use crate::domain::filemetadata::FileMetadata;
use crate::infrastructure::fs::scanner;
use crate::infrastructure::media::metadata::generate_file_metadata;
use crate::infrastructure::repo::image_repo;
use crate::state::Db;

use futures::stream::{self, StreamExt};
use std::io::Error;
use std::path::PathBuf;
use std::time::Instant;

use tokio::task;

const CHUNK_SIZE: usize = 50;

async fn extract_metadata_parallel(files: Vec<PathBuf>) -> Vec<FileMetadata> {
  let concurrency = (num_cpus::get() * 2).min(32);
  stream::iter(files)
    .map(|path| task::spawn_blocking(move || generate_file_metadata(&path)))
    .buffer_unordered(concurrency)
    .filter_map(|res| async {
      match res {
        Ok(Ok(meta)) => Some(meta),
        Ok(Err(e)) => {
          log::error!("Metadata error: {}", e);
          None
        }
        Err(e) => {
          log::error!("Join error: {}", e);
          None
        }
      }
    })
    .collect()
    .await
}

async fn persist_images(db: &Db, image_files: &[FileMetadata]) -> Result<u64, Error> {
  let mut imported = 0;

  for chunk in image_files.chunks(CHUNK_SIZE) {
    imported += image_repo::bulk_insert_image(db, chunk)
      .await
      .map_err(|e| Error::other(format!("Bulk insert failed: {}", e)))?;
  }

  Ok(imported)
}

async fn import_image_batch(db: &Db, files: Vec<PathBuf>) -> Result<ImportSummary, Error> {
  let total = files.len();
  log::info!("Processing {} files", total);

  let metadata = extract_metadata_parallel(files).await;
  let scanned = metadata.len();
  let failed = total - scanned;

  let image_files: Vec<FileMetadata> = metadata.into_iter().collect();

  let imported = persist_images(db, &image_files).await?;
  let skipped = scanned - imported as usize;

  log::info!("Imported {} files", imported);
  log::info!("Skipped {} files", skipped);
  log::info!("Failed {} files", failed);

  Ok(ImportSummary {
    total,
    scanned,
    imported: imported as usize,
    skipped,
    failed,
  })
}

pub async fn scan_and_import_images(db: &Db, paths: Vec<PathBuf>) -> Result<ImportSummary, Error> {
  let t0 = Instant::now();
  log::info!("Scan + import started");

  let mut set = task::JoinSet::new();
  let mut discovered = Vec::new();

  for path in paths {
    set.spawn_blocking(move || scanner::perform_file_scan_for_images(path));
  }

  while let Some(res) = set.join_next().await {
    let (images, _) = res.map_err(|_| Error::other("Scan task failed"))?;
    discovered.extend(images);
  }

  let summary = import_image_batch(db, discovered).await?;

  log::info!("Scan completed in {:?}", t0.elapsed());

  Ok(summary)
}
