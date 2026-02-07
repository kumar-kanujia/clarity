use serde::Serialize;

use crate::domain::entity::ImageFile;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Image {
  pub path: String,
  pub filename: String,
  pub size: String,
  pub resolution: String,
}

impl From<ImageFile> for Image {
  fn from(file: ImageFile) -> Self {
    Self {
      path: file.path,
      filename: file.filename,
      size: file.size_string,
      resolution: file.dimension_string,
    }
  }
}
