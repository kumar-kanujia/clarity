use serde::{Deserialize, Serialize};

use crate::domain::imagefile::ImageFile;

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct FileMetadata {
  pub file_name: String,
  pub file_size: u64,
  pub ctx: u64,
  pub mtx: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct ImageMetadata {
  pub file_meta: FileMetadata,
  pub file_path: String,
  pub thumbnail_path: String,
  pub dim_x: u32,
  pub dim_y: u32,
}

impl From<ImageFile> for ImageMetadata {
  fn from(file: ImageFile) -> Self {
    Self {
      file_meta: FileMetadata {
        file_name: file.file_name,
        file_size: file.file_size.cast_unsigned(),
        ctx: file.ctx.cast_unsigned(),
        mtx: file.mtx.cast_unsigned(),
      },
      file_path: file.file_path,
      thumbnail_path: file.thumbnail_path,
      dim_x: file.dim_x,
      dim_y: file.dim_y,
    }
  }
}
