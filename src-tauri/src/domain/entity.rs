use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ImageFile {
  pub id: i32,
  pub filename: String,
  pub path: String,
  pub size_bytes: u32,
  pub size_string: String,
  pub dimension_x: u32,
  pub dimension_y: u32,
  pub dimension_string: String,
  pub image_extension: String,
  pub original_path: String,
  pub mean_hash: String,
}

impl ImageFile {
  pub fn dimensions_string(dimension_x: u32, dimension_y: u32) -> String {
    format!("{dimension_x}x{dimension_y}")
  }

  pub fn size_string(size: f32) -> String {
    if size < 1024.0 {
      format!("{:.2} KB", size / 1000.0)
    } else if size < 1024.0 * 1024.0 {
      format!("{:.2} MB", size / 1_000_000.0)
    } else {
      format!("{:.2} GB", size / 1_000_000_000.0)
    }
  }
}
