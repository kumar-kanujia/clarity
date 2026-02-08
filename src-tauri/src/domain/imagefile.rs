use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow, Default)]
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

  pub fn size_string(bytes: f64) -> String {
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

#[cfg(test)]
mod dimension_tests {
  use super::*;

  #[test]
  fn builds_dimension_string_correctly() {
    let result = ImageFile::dimensions_string(1920, 1080);
    assert_eq!(result, "1920x1080");
  }

  #[test]
  fn handles_zero_dimensions() {
    let result = ImageFile::dimensions_string(0, 0);
    assert_eq!(result, "0x0");
  }
}

#[cfg(test)]
mod size_string_tests {
  use super::*;

  #[test]
  fn formats_kilobytes() {
    let result = ImageFile::size_string(500.0);
    assert_eq!(result, "0.50 KB");
  }

  #[test]
  fn formats_megabytes() {
    let result = ImageFile::size_string(500_000.0);
    assert_eq!(result, "500.00 KB");
  }

  #[test]
  fn formats_gigabytes() {
    let result = ImageFile::size_string(1_500_000_000.0);
    assert_eq!(result, "1.50 GB");
  }

  #[test]
  fn handles_exact_thresholds() {
    let kb_to_mb = ImageFile::size_string(1024.0);
    assert_eq!(kb_to_mb, "1.02 KB");

    let mb_to_gb = ImageFile::size_string(1_048_576.0);
    assert_eq!(mb_to_gb, "1.05 MB");
  }
}

#[cfg(test)]
mod image_conversion_tests {
  use super::*;
  use crate::domain::dto::Image;

  #[test]
  fn converts_image_file_into_image_dto() {
    let image_file = ImageFile {
      id: 1,
      filename: "photo.png".into(),
      path: "/uploads".into(),
      size_bytes: 500_000,
      size_string: ImageFile::size_string(500_000.0),
      dimension_x: 1920,
      dimension_y: 1080,
      dimension_string: ImageFile::dimensions_string(1920, 1080),
      image_extension: "png".into(),
      original_path: "/originals/photo.png".into(),
      mean_hash: "abc123".into(),
    };

    let image: Image = image_file.into();

    assert_eq!(image.path, "/uploads");
    assert_eq!(image.filename, "photo.png");
    assert_eq!(image.size, "500.00 KB");
    assert_eq!(image.resolution, "1920x1080");
  }
}
