use std::sync::atomic::{AtomicUsize, Ordering};

use crate::domain::imagefile::ImageFile;

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
      path: format!("{}.{}", file.file_id, file.image_extension),
      size: file.size_string(),
      resolution: file.dimensions_string(),
      filename: file.filename,
    }
  }
}

pub enum ImportStatus {
  Imported,
  Skipped,
}

#[derive(Debug, Default)]
pub struct ImportCounters {
  pub scanned: AtomicUsize,
  pub imported: AtomicUsize,
  pub skipped: AtomicUsize,
  pub failed: AtomicUsize,
}

impl Into<ImportSummary> for ImportCounters {
  fn into(self) -> ImportSummary {
    ImportSummary {
      // TODO: Improve this
      total: 0,
      scanned: self.scanned.load(Ordering::Relaxed),
      imported: self.imported.load(Ordering::Relaxed),
      skipped: self.skipped.load(Ordering::Relaxed),
      failed: self.failed.load(Ordering::Relaxed),
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
