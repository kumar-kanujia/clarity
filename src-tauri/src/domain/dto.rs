use crate::domain::imagefile::ImageFile;

use serde::Serialize;

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
      path: format!("{}.{}", file.file_id, file.image_extension),
      size: file.size_string(),
      resolution: file.dimensions_string(),
      filename: file.filename,
    }
  }
}
