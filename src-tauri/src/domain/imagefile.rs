use serde::{Deserialize, Serialize};
use sqlx::FromRow;

use crate::domain::filemetadata::FileMetadata;

#[derive(Debug, Serialize, Deserialize, FromRow, Default, Clone)]
pub struct ImageFile {
  pub seq_id: i64,
  pub file_name: String,
  pub file_path: String,
  pub thumbnail_path: String,
  pub file_size: i64,
  pub dim_x: u32,
  pub dim_y: u32,
  pub ctx: i64,
  pub mtx: i64,
  pub imported_at: i64,
  pub is_processed: i64,
}

impl ImageFile {
  pub fn dimensions_string(&self) -> String {
    format!("{}x{}", self.dim_x, self.dim_y)
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
