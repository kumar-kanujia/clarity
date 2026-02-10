use serde::{Deserialize, Serialize};
use sqlx::FromRow;

use crate::domain::imagemetadata::ImageMetadata;

#[derive(Debug, Serialize, Deserialize, FromRow, Default, Clone)]
pub struct ImageFile {
  pub seq_id: i64,
  pub file_name: String,
  pub file_path: String,
  pub thumbnail_path: String,
  pub file_size: i64,
  pub dimension_x: u32,
  pub dimension_y: u32,
  pub created_at: i64,
  pub modified_at: i64,
}

impl ImageFile {
  pub fn dimensions_string(&self) -> String {
    format!("{}x{}", self.dimension_x, self.dimension_y)
  }

  pub fn size_string(&self) -> String {
    const KB: f64 = 1_000.0;
    const MB: f64 = 1_000_000.0;
    const GB: f64 = 1_000_000_000.0;

    let bytes = self.file_size as f64;

    let (value, unit) = if bytes < MB {
      (bytes / KB, "KB")
    } else if bytes < GB {
      (bytes / MB, "MB")
    } else {
      (bytes / GB, "GB")
    };

    format!("{value:.2} {unit}")
  }
}

impl From<ImageMetadata> for ImageFile {
  fn from(meta: ImageMetadata) -> Self {
    Self {
      seq_id: 0,
      file_name: meta.file_meta.file_name,
      file_path: meta.file_path,
      thumbnail_path: meta.thumbnail_path,
      file_size: meta.file_meta.file_size.cast_signed(),
      dimension_x: meta.dimension_x,
      dimension_y: meta.dimension_y,
      created_at: meta.file_meta.created_at.cast_signed(),
      modified_at: meta.file_meta.modified_at.cast_signed(),
    }
  }
}
