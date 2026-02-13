use crate::{
  domain::{image::Image, import_summary::ImportSummary},
  error::AppError,
  infrastructure::{
    fs::scanner,
    processing::metadata::{self, MetadataExtractStatus},
    repo::{error::DatabaseError, image_repo},
  },
  setup::state::Db,
};

use std::path::PathBuf;

/// Batch size for image save operations
pub const CHUNK_SIZE: usize = 50;

async fn persist_images(db: &Db, image_files: &[Image]) -> Result<i64, DatabaseError> {
  let mut imported = 0;

  for chunk in image_files.chunks(CHUNK_SIZE) {
    imported += image_repo::bulk_insert_image(db, chunk).await? as i64;
  }

  Ok(imported)
}

async fn import_images_batch(db: &Db, files: Vec<PathBuf>) -> Result<ImportSummary, AppError> {
  let discovered = files.len() as i64;

  let MetadataExtractStatus {
    result,
    not_found,
    permission_denied,
    io_errors,
  } = metadata::extract_files_metadata_concurrent(files).await;

  let processed = result.len() as i64;

  let imported = persist_images(db, &result).await? as i64;

  let skipped = processed - imported;

  Ok(ImportSummary {
    discovered,
    processed,
    imported,
    skipped,
    not_found,
    permission_denied,
    io_errors,
    selected: 0,
    walk_errors: 0,
  })
}

#[tracing::instrument]
pub async fn scan_and_import_images(
  db: &Db,
  paths: Vec<String>,
) -> Result<ImportSummary, AppError> {
  let mut set = tokio::task::JoinSet::new();

  let mut discovered = Vec::new();

  let mut total_files = 0;
  let mut walk_errors = 0;

  for path in paths {
    let path = PathBuf::from(path);
    set.spawn_blocking(move || scanner::perform_file_scan_for_images(&path));
  }

  while let Some(res) = set.join_next().await {
    let scan_result = res
      .map_err(|e| AppError::Join(e.to_string()))?
      .map_err(AppError::from)?;

    total_files += scan_result.total_files;
    walk_errors += scan_result.walk_errors;
    discovered.extend(scan_result.images);
  }

  let mut summary = import_images_batch(db, discovered).await?;

  summary.selected = total_files;
  summary.walk_errors = walk_errors;
  Ok(summary)
}
