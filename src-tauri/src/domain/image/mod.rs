use crate::{
  infrastructure::{
    models::image_model::{ImageModel, ImageStatus},
    system::format_datetime,
  },
  interface::dto::ImageDto,
};

use std::sync::OnceLock;

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

static IMAGE_EXTENSIONS: OnceLock<Vec<&'static str>> = OnceLock::new();

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

impl From<ImageModel> for Image {
  fn from(model: ImageModel) -> Self {
    Self {
      id: model.id,
      path: model.path,
      size_bytes: model.size_bytes,
      content_hash: model.content_hash.unwrap_or_default(),
      width: model.width.unwrap_or_default(),
      height: model.height.unwrap_or_default(),
      thumbnail_path: model.thumbnail_path.unwrap_or_default(),
      status: model.status,
      retry_count: model.retry_count,
      error_message: model.error_message,
      created_at: format_datetime(model.created_at),
      updated_at: format_datetime(model.updated_at),
    }
  }
}
