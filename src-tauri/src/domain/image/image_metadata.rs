use serde::{Deserialize, Serialize};

use crate::domain::image::ImageFile;

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct ImageMetadata {
  pub thumbnail_path: String,
  pub dim_x: u32,
  pub dim_y: u32,
}

impl From<ImageFile> for ImageMetadata {
  fn from(file: ImageFile) -> Self {
    Self {
      thumbnail_path: file.thumbnail_path,
      dim_x: file.dim_x,
      dim_y: file.dim_y,
    }
  }
}
