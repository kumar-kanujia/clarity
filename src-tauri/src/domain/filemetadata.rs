use serde::{Deserialize, Serialize};

use crate::domain::imagefile::ImageFile;

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct FileMetadata {
  pub file_path: String,
  pub file_name: String,
  pub file_size: u64,
  pub ctx: Option<u64>,
  pub mtx: Option<u64>,
}

// impl From<ImageFile> for FileMetadata {
//   fn from(file: ImageFile) -> Self {
//     Self {
//       file_path: file.file_path,
//       file_name: file.file_name,
//       file_size: file.file_size.cast_unsigned(),
//       ctx: file.ctx.cast_unsigned(),
//       mtx: file.mtx.cast_unsigned(),
//     }
//   }
// }
