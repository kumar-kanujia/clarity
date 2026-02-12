use crate::{
  application::dtos::ImportSummary,
  domain::filemetadata::FileMetadata,
  error::AppError,
  infrastructure::{
    fs::scanner,
    media::metadata::{self, MetadataStats},
    repo::{error::DatabaseError, image_repo},
  },
  setup::state::Db,
};

use std::path::PathBuf;

/// Batch size for image save operations
pub const CHUNK_SIZE: usize = 50;

async fn persist_images(db: &Db, image_files: &[FileMetadata]) -> Result<u64, DatabaseError> {
  let mut imported = 0;

  for chunk in image_files.chunks(CHUNK_SIZE) {
    imported += image_repo::bulk_insert_image(db, chunk).await?;
  }

  Ok(imported)
}

async fn import_image_batch(db: &Db, files: Vec<PathBuf>) -> Result<ImportSummary, AppError> {
  let discovered = files.len();

  let MetadataStats {
    metadata,
    not_found,
    permission_denied,
    io_errors,
  } = metadata::extract_metadata_parallel(files).await;

  let processed = metadata.len();

  let imported = persist_images(db, &metadata).await? as usize;

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

pub async fn scan_and_import_images(
  db: &Db,
  paths: Vec<PathBuf>,
) -> Result<ImportSummary, AppError> {
  let mut set = tokio::task::JoinSet::new();
  let mut discovered = Vec::new();
  let mut total_files = 0;
  let mut walk_errors = 0;

  for path in paths {
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

  let mut summary = import_image_batch(db, discovered).await?;

  summary.selected = total_files;
  summary.walk_errors = walk_errors;
  Ok(summary)
}
