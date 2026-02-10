use crate::domain::imagefile::ImageFile;

use std::sync::{
  Arc,
  atomic::{AtomicUsize, Ordering},
};

use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Image {
  pub file_name: String,
  pub path: String,
  pub thumbnail_path: String,
  pub file_size: String,
  pub dimension: String,
}

impl From<ImageFile> for Image {
  fn from(file: ImageFile) -> Self {
    Self {
      file_size: file.size_string(),
      dimension: file.dimensions_string(),
      file_name: file.file_name,
      path: file.file_path,
      thumbnail_path: file.thumbnail_path,
    }
  }
}

pub enum ProcessStatus {
  Processed,
  Skipped,
}

#[derive(Debug, Default)]
pub struct ImportCounters {
  pub scanned: AtomicUsize,
  pub imported: AtomicUsize,
  pub skipped: AtomicUsize,
  pub failed: AtomicUsize,
}

impl From<Arc<ImportCounters>> for ImportSummary {
  fn from(val: Arc<ImportCounters>) -> Self {
    ImportSummary {
      // TODO: Improve this
      total: 0,
      scanned: val.scanned.load(Ordering::Relaxed),
      imported: val.imported.load(Ordering::Relaxed),
      skipped: val.skipped.load(Ordering::Relaxed),
      failed: val.failed.load(Ordering::Relaxed),
    }
  }
}

#[derive(Debug, Default, Serialize)]
pub struct ImportSummary {
  pub total: usize,
  pub scanned: usize,
  pub imported: usize,
  pub skipped: usize,
  pub failed: usize,
}
