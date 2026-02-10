use crate::domain::imagefile::ImageFile;

use std::sync::{
  Arc,
  atomic::{AtomicUsize, Ordering},
};

use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Image {
  pub path: String,
  pub filename: String,
  pub size: String,
  pub resolution: String,
}

impl From<ImageFile> for Image {
  fn from(file: ImageFile) -> Self {
    Self {
      path: file.file_path.clone(),
      size: file.size_string(),
      resolution: file.dimensions_string(),
      filename: file.file_path.split('/').next_back().unwrap().to_string(),
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
