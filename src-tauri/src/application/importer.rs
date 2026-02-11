use crate::application::dto::ImportSummary;
use crate::domain::filemetadata::FileMetadata;
use crate::error::AppError;
use crate::infrastructure::fs::scanner;
use crate::infrastructure::media::metadata::{self, MetadataStats};
use crate::infrastructure::repo::image_repo;
use crate::state::Db;

use std::io::Error;
use std::path::PathBuf;

const CHUNK_SIZE: usize = 50;

async fn persist_images(db: &Db, image_files: &[FileMetadata]) -> Result<u64, Error> {
  let mut imported = 0;

  for chunk in image_files.chunks(CHUNK_SIZE) {
    imported += image_repo::bulk_insert_image(db, chunk)
      .await
      .map_err(|e| Error::other(format!("Bulk insert failed: {}", e)))?;
  }

  Ok(imported)
}

async fn import_image_batch(db: &Db, files: Vec<PathBuf>) -> Result<ImportSummary, AppError> {
  let total = files.len();

  let MetadataStats {
    metadata,
    not_found,
    permission_denied,
    io_errors,
  } = metadata::extract_metadata_parallel(files).await;

  let scanned = metadata.len();

  let image_files: Vec<FileMetadata> = metadata.into_iter().collect();

  let imported = persist_images(db, &image_files)
    .await
    .map_err(|e| AppError::Database(format!("Persist failed: {e}")))?;

  let skipped = scanned - imported as usize;

  Ok(ImportSummary {
    total,
    scanned,
    imported: imported as usize,
    skipped,
    failed: not_found + permission_denied + io_errors,
    ..ImportSummary::default()
  })
}

pub async fn scan_and_import_images(
  db: &Db,
  paths: Vec<PathBuf>,
) -> Result<ImportSummary, AppError> {
  let mut set = tokio::task::JoinSet::new();
  let mut discovered = Vec::new();
  let mut total_files = 0;
  let mut walk_errors = 0;

  for path in paths {
    set.spawn_blocking(move || scanner::perform_file_scan_for_images(path));
  }

  while let Some(res) = set.join_next().await {
    let inner = res.map_err(|e| AppError::Scan(format!("Scan task join failure: {e}")))?;

    let scan_result = inner.map_err(|e| AppError::Scan(format!("Scan failed: {e}")))?;

    total_files += scan_result.total_files;
    walk_errors += scan_result.walk_errors;
    discovered.extend(scan_result.images);
  }

  let mut summary = import_image_batch(db, discovered).await?;

  summary.total = total_files;
  summary.walk_errors = walk_errors;
  Ok(summary)
}
