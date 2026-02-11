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
  pub file_path: String,
  pub thumbnail_path: String,
  pub file_size: String,
  pub resolution: String,
}

impl From<ImageFile> for Image {
  fn from(file: ImageFile) -> Self {
    Self {
      file_size: file.size_string(),
      resolution: file.dimensions_string(),
      file_name: file.file_name,
      file_path: file.file_path,
      thumbnail_path: file.thumbnail_path,
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
