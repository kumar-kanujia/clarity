use serde::Serialize;

use crate::domain::imagefile::ImageFile;

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

#[cfg(test)]
mod tests {
  use serde_json::json;

  use crate::domain::{dto::Image, imagefile::ImageFile};

  #[test]
  fn converts_image_file_into_image() {
    let image_file = ImageFile {
      path: "/images/uploads".to_string(),
      filename: "photo.png".to_string(),
      size_string: "2.3 MB".to_string(),
      dimension_string: "1920x1080".to_string(),
      ..Default::default()
    };

    let image: Image = image_file.into();

    assert_eq!(image.path, "/images/uploads");
    assert_eq!(image.filename, "photo.png");
    assert_eq!(image.size, "2.3 MB");
    assert_eq!(image.resolution, "1920x1080");
  }

  #[test]
  fn serializes_image_with_camel_case_fields() {
    let image = Image {
      path: "/images/uploads".to_string(),
      filename: "photo.png".to_string(),
      size: "2.3 MB".to_string(),
      resolution: "1920x1080".to_string(),
    };

    let serialized = serde_json::to_value(&image).unwrap();

    let expected = json!({
        "path": "/images/uploads",
        "filename": "photo.png",
        "size": "2.3 MB",
        "resolution": "1920x1080"
    });

    assert_eq!(serialized, expected);
  }
}
