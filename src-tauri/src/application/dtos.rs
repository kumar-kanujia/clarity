use std::cmp;

use crate::domain::imagefile::{ImageFile, ProcessStatus};

use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Image {
  pub seq_id: i64,
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
      seq_id: file.seq_id,
      file_size: file.size_string(),
      resolution: file.dimensions_string(),
      file_name: file.file_name(),
      file_path: file.file_path,
      thumbnail_path: file.thumbnail_path,
      created_at: cmp::max(file.ctx, file.mtx),
      is_processed: file.process_status == ProcessStatus::Complete,
    }
  }
}

#[derive(Debug, Default, Serialize)]
pub struct ImportSummary {
  /// Total files selected for import
  pub selected: usize,

  /// Image files discovered during filesystem scan
  pub discovered: usize,

  /// Image files that entered metadata extraction
  pub processed: usize,

  /// Successfully inserted into database
  pub imported: usize,

  /// Ignored due to duplicates or constraints
  pub skipped: usize,

  /// File not found during metadata extraction
  pub not_found: usize,

  /// Permission denied during metadata extraction
  pub permission_denied: usize,

  /// IO errors during metadata extraction
  pub io_errors: usize,

  /// Filesystem traversal errors
  pub walk_errors: usize,
}
