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
    let size = file.size_string();
    let resolution = file.dimensions_string();
    let path = format!("{}.{}", file.file_id, file.image_extension);
    let filename = file.filename;

    Self {
      path,
      filename,
      size,
      resolution,
    }
  }
}
