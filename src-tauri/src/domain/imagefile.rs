use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow, Default, Clone)]
pub struct ImageFile {
  pub file_id: String,
  pub filename: String,
  pub size: i64,
  pub dimension_x: u32,
  pub dimension_y: u32,
  pub image_extension: String,
  pub original_path: String,
}

impl ImageFile {
  pub fn dimensions_string(&self) -> String {
    format!("{}x{}", self.dimension_x, self.dimension_y)
  }

  pub fn storage_file_name(&self) -> String {
    format!("{}.{}", self.file_id, self.image_extension)
  }

  pub fn size_string(&self) -> String {
    const KB: f64 = 1_000.0;
    const MB: f64 = 1_000_000.0;
    const GB: f64 = 1_000_000_000.0;

    let bytes = self.size as f64;

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
