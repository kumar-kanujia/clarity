use crate::{
  infrastructure::{
    models::image_model::{ImageRow, ImageStatus},
    system::format_datetime,
  },
  interface::dto::ImageDto,
};

use std::sync::OnceLock;

pub const MAX_WORKER_RETRIES: i32 = 3;

static IMAGE_EXTENSIONS: OnceLock<Vec<&'static str>> = OnceLock::new();

#[derive(Debug, Clone, Default)]
pub struct ImageMetadata {
  pub thumbnail_path: String,
  pub width: i64,
  pub height: i64,
}

#[derive(Debug, Default, Clone)]
pub struct Image {
  pub id: i64,
  pub path: String,
  pub size_bytes: i64,
  pub width: i64,
  pub height: i64,
  pub thumbnail_path: String,
  pub content_hash: Vec<u8>,
  pub status: ImageStatus,
  pub retry_count: i64,
  pub error_message: Option<String>,
  pub created_at: String,
  #[allow(dead_code)]
  pub updated_at: String,
}

impl Image {
  pub fn get_extensions() -> &'static [&'static str] {
    IMAGE_EXTENSIONS.get_or_init(|| vec!["jpg", "jpeg", "png", "webp", "bmp", "gif", "heic"])
  }

  pub fn resolution(&self) -> String {
    format!("{}x{}", self.width, self.height)
  }

  pub fn size_string(&self) -> String {
    const KB: f64 = 1_000.0;
    const MB: f64 = 1_000_000.0;
    const GB: f64 = 1_000_000_000.0;

    #[allow(clippy::cast_precision_loss)]
    let bytes = self.size_bytes as f64;

    let (value, unit) = if bytes < MB {
      (bytes / KB, "KB")
    } else if bytes < GB {
      (bytes / MB, "MB")
    } else {
      (bytes / GB, "GB")
    };

    format!("{value:.2} {unit}")
  }

  pub fn update_hash(&mut self, content_hash: Vec<u8>) {
    self.content_hash = content_hash;
    self.status = ImageStatus::Hashed;
    self.retry_count = 0;
    self.error_message = None;
  }

  pub fn mark_hash_error(&mut self, error_message: String) {
    self.status = ImageStatus::Pending;
    self.error_message = Some(error_message);
    self.retry_count += 1;
  }

  pub fn update_image_metadata(&mut self, image_metadata: ImageMetadata) {
    self.thumbnail_path = image_metadata.thumbnail_path;
    self.width = image_metadata.width;
    self.height = image_metadata.height;
    self.status = ImageStatus::Thumbnailed;
    self.retry_count = 0;
    self.error_message = None;
  }

  pub fn mark_image_metadata_error(&mut self, error_message: String) {
    self.status = ImageStatus::Hashed;
    self.error_message = Some(error_message);
    self.retry_count += 1;
  }

  pub fn group_by_hash(images: Vec<Image>) -> Vec<Vec<ImageDto>> {
    if images.is_empty() {
      return Vec::new();
    }

    let mut grouped_images = Vec::new();
    let mut current_group = Vec::new();
    let mut curr_hash: Option<Vec<u8>> = None;

    for image in images {
      if image.content_hash.is_empty() {
        continue;
      }

      if let Some(ref h) = curr_hash
        && *h != image.content_hash
      {
        grouped_images.push(current_group);
        current_group = Vec::new();
        curr_hash = Some(image.content_hash.clone());
      } else {
        curr_hash = Some(image.content_hash.clone());
      }
      current_group.push(image.into());
    }
    if !current_group.is_empty() {
      grouped_images.push(current_group);
    }

    grouped_images
  }
}

impl From<ImageRow> for Image {
  fn from(row: ImageRow) -> Self {
    Self {
      id: row.id,
      path: row.path,
      size_bytes: row.size_bytes,
      content_hash: row.content_hash.unwrap_or_default(),
      width: row.width.unwrap_or_default(),
      height: row.height.unwrap_or_default(),
      thumbnail_path: row.thumbnail_path.unwrap_or_default(),
      status: row.status,
      retry_count: row.retry_count,
      error_message: row.error_message,
      created_at: format_datetime(row.created_at),
      updated_at: format_datetime(row.updated_at),
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_get_extensions() {
    let extensions = Image::get_extensions();
    assert_eq!(extensions.len(), 7);
    assert!(extensions.contains(&"jpg"));
    assert!(extensions.contains(&"png"));
    assert!(extensions.contains(&"webp"));
    assert!(extensions.contains(&"heic"));
  }

  #[test]
  fn test_resolution() {
    let image = Image {
      width: 1920,
      height: 1080,
      ..Default::default()
    };
    assert_eq!(image.resolution(), "1920x1080");
  }

  #[test]
  fn test_resolution_zero_dimensions() {
    let image = Image::default();
    assert_eq!(image.resolution(), "0x0");
  }

  #[test]
  fn test_size_string_kb() {
    let image = Image {
      size_bytes: 5000,
      ..Default::default()
    };
    assert_eq!(image.size_string(), "5.00 KB");
  }

  #[test]
  fn test_size_string_mb() {
    let image = Image {
      size_bytes: 5_000_000,
      ..Default::default()
    };
    assert_eq!(image.size_string(), "5.00 MB");
  }

  #[test]
  fn test_size_string_gb() {
    let image = Image {
      size_bytes: 5_000_000_000,
      ..Default::default()
    };
    assert_eq!(image.size_string(), "5.00 GB");
  }

  #[test]
  fn test_size_string_boundary_kb_mb() {
    let image = Image {
      size_bytes: 999_999,
      ..Default::default()
    };
    assert_eq!(image.size_string(), "1000.00 KB");
  }

  #[test]
  fn test_size_string_boundary_mb_gb() {
    let image = Image {
      size_bytes: 999_999_999,
      ..Default::default()
    };
    assert_eq!(image.size_string(), "1000.00 MB");
  }

  #[test]
  fn test_update_hash() {
    let mut image = Image {
      status: ImageStatus::Pending,
      retry_count: 2,
      error_message: Some("error".to_string()),
      ..Default::default()
    };

    let hash = vec![1, 2, 3, 4];
    image.update_hash(hash.clone());

    assert_eq!(image.content_hash, hash);
    assert_eq!(image.status, ImageStatus::Hashed);
    assert_eq!(image.retry_count, 0);
    assert_eq!(image.error_message, None);
  }

  #[test]
  fn test_mark_hash_error() {
    let mut image = Image {
      status: ImageStatus::Hashed,
      retry_count: 1,
      ..Default::default()
    };

    image.mark_hash_error("hash failed".to_string());

    assert_eq!(image.status, ImageStatus::Pending);
    assert_eq!(image.error_message, Some("hash failed".to_string()));
    assert_eq!(image.retry_count, 2);
  }

  #[test]
  fn test_update_image_metadata() {
    let mut image = Image {
      status: ImageStatus::Hashed,
      retry_count: 1,
      error_message: Some("error".to_string()),
      ..Default::default()
    };

    let metadata = ImageMetadata {
      thumbnail_path: "/path/to/thumb.jpg".to_string(),
      width: 1920,
      height: 1080,
    };

    image.update_image_metadata(metadata);

    assert_eq!(image.thumbnail_path, "/path/to/thumb.jpg");
    assert_eq!(image.width, 1920);
    assert_eq!(image.height, 1080);
    assert_eq!(image.status, ImageStatus::Thumbnailed);
    assert_eq!(image.retry_count, 0);
    assert_eq!(image.error_message, None);
  }

  #[test]
  fn test_mark_image_metadata_error() {
    let mut image = Image {
      status: ImageStatus::Thumbnailed,
      retry_count: 0,
      ..Default::default()
    };

    image.mark_image_metadata_error("thumbnail failed".to_string());

    assert_eq!(image.status, ImageStatus::Hashed);
    assert_eq!(image.error_message, Some("thumbnail failed".to_string()));
    assert_eq!(image.retry_count, 1);
  }

  #[test]
  fn test_group_by_hash_empty() {
    let images = vec![];
    let grouped = Image::group_by_hash(images);
    assert!(grouped.is_empty());
  }

  #[test]
  fn test_group_by_hash_single_image() {
    let image = Image {
      id: 1,
      path: "/test1.jpg".to_string(),
      content_hash: vec![1, 2, 3],
      created_at: "2024-01-01".to_string(),
      ..Default::default()
    };

    let grouped = Image::group_by_hash(vec![image]);
    assert_eq!(grouped.len(), 1);
    assert_eq!(grouped[0].len(), 1);
  }

  #[test]
  fn test_group_by_hash_same_hash() {
    let image1 = Image {
      id: 1,
      path: "/test1.jpg".to_string(),
      content_hash: vec![1, 2, 3],
      created_at: "2024-01-01".to_string(),
      ..Default::default()
    };

    let image2 = Image {
      id: 2,
      path: "/test2.jpg".to_string(),
      content_hash: vec![1, 2, 3],
      created_at: "2024-01-02".to_string(),
      ..Default::default()
    };

    let grouped = Image::group_by_hash(vec![image1, image2]);
    assert_eq!(grouped.len(), 1);
    assert_eq!(grouped[0].len(), 2);
  }

  #[test]
  fn test_group_by_hash_different_hashes() {
    let image1 = Image {
      id: 1,
      path: "/test1.jpg".to_string(),
      content_hash: vec![1, 2, 3],
      created_at: "2024-01-01".to_string(),
      ..Default::default()
    };

    let image2 = Image {
      id: 2,
      path: "/test2.jpg".to_string(),
      content_hash: vec![4, 5, 6],
      created_at: "2024-01-02".to_string(),
      ..Default::default()
    };

    let grouped = Image::group_by_hash(vec![image1, image2]);
    assert_eq!(grouped.len(), 2);
    assert_eq!(grouped[0].len(), 1);
    assert_eq!(grouped[1].len(), 1);
  }

  #[test]
  fn test_group_by_hash_skips_empty_hash() {
    let image1 = Image {
      id: 1,
      path: "/test1.jpg".to_string(),
      content_hash: vec![],
      created_at: "2024-01-01".to_string(),
      ..Default::default()
    };

    let image2 = Image {
      id: 2,
      path: "/test2.jpg".to_string(),
      content_hash: vec![1, 2, 3],
      created_at: "2024-01-02".to_string(),
      ..Default::default()
    };

    let grouped = Image::group_by_hash(vec![image1, image2]);
    assert_eq!(grouped.len(), 1);
    assert_eq!(grouped[0].len(), 1);
    assert_eq!(grouped[0][0].id, 2);
  }

  #[test]
  fn test_group_by_hash_multiple_groups() {
    let images = vec![
      Image {
        id: 1,
        content_hash: vec![1, 2, 3],
        created_at: "2024-01-01".to_string(),
        ..Default::default()
      },
      Image {
        id: 2,
        content_hash: vec![1, 2, 3],
        created_at: "2024-01-02".to_string(),
        ..Default::default()
      },
      Image {
        id: 3,
        content_hash: vec![4, 5, 6],
        created_at: "2024-01-03".to_string(),
        ..Default::default()
      },
      Image {
        id: 4,
        content_hash: vec![4, 5, 6],
        created_at: "2024-01-04".to_string(),
        ..Default::default()
      },
      Image {
        id: 5,
        content_hash: vec![4, 5, 6],
        created_at: "2024-01-05".to_string(),
        ..Default::default()
      },
    ];

    let grouped = Image::group_by_hash(images);
    assert_eq!(grouped.len(), 2);
    assert_eq!(grouped[0].len(), 2);
    assert_eq!(grouped[1].len(), 3);
  }
}