use crate::domain::imagefile::{ImageFile, ProcessStatus};

use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Image {
  pub file_name: String,
  pub file_path: String,
  pub thumbnail_path: String,
  pub file_size: String,
  pub resolution: String,
  pub created_at: i64,
  pub is_processed: bool,
}

impl From<ImageFile> for Image {
  fn from(file: ImageFile) -> Self {
    Self {
      file_size: file.size_string(),
      resolution: file.dimensions_string(),
      file_name: file.file_name,
      file_path: file.file_path,
      thumbnail_path: file.thumbnail_path,
      created_at: file.ctx,
      is_processed: file.process_status == ProcessStatus::Complete,
    }
  }
}

#[derive(Debug, Default, Serialize)]
pub struct ImportSummary {
  /// Total files discovered by scanner
  pub total: usize,
  /// Files processed in import pipeline
  pub scanned: usize,
  /// Successfully imported
  pub imported: usize,
  /// Filtered out (not image, duplicate, etc.)
  pub skipped: usize,
  /// Pipeline failures (hash, thumbnail, DB)
  pub failed: usize,
  /// Filesystem traversal errors
  pub walk_errors: usize,
}
