use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow, Default, Clone)]
pub struct ImageFile {
  pub file_id: String,
  pub filename: String,
  pub size: u32,
  pub dimension_x: u32,
  pub dimension_y: u32,
  pub image_extension: String,
  pub original_path: String,
}

impl ImageFile {
  pub fn dimensions_string(&self) -> String {
    format!("{}x{}", self.dimension_x, self.dimension_y)
  }

  pub fn size_string(&self) -> String {
    let bytes: f64 = self.size as f64;
    const KB: f64 = 1_000.0;
    const MB: f64 = 1_000_000.0;
    const GB: f64 = 1_000_000_000.0;

    if bytes < MB {
      format!("{:.2} KB", bytes / KB)
    } else if bytes < GB {
      format!("{:.2} MB", bytes / MB)
    } else {
      format!("{:.2} GB", bytes / GB)
    }
  }
}
