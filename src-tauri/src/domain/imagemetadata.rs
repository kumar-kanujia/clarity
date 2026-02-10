use serde::{Deserialize, Serialize};

use crate::domain::imagefile::ImageFile;

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct FileMetadata {
  pub file_name: String,
  pub file_size: u64,
  pub created_at: u64,
  pub modified_at: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct ImageMetadata {
  pub file_meta: FileMetadata,
  pub file_path: String,
  pub thumbnail_path: String,
  pub dimension_x: u32,
  pub dimension_y: u32,
}

impl From<ImageFile> for ImageMetadata {
  fn from(file: ImageFile) -> Self {
    Self {
      file_meta: FileMetadata {
        file_name: file.file_name,
        file_size: file.file_size.cast_unsigned(),
        created_at: file.created_at.cast_unsigned(),
        modified_at: file.modified_at.cast_unsigned(),
      },
      file_path: file.file_path,
      thumbnail_path: file.thumbnail_path,
      dimension_x: file.dimension_x,
      dimension_y: file.dimension_y,
    }
  }
}
