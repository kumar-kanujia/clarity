use crate::{
  infrastructure::{
    models::image_model::{ImageModel, ImageStatus},
    system::format_datetime,
  },
  interface::dto::ImageDto,
};

#[derive(Debug)]
pub struct FileMetaData {
  pub path: String,
  pub size_bytes: i64,
  pub created_at: String,
}

#[derive(Debug, Default, Clone)]
pub struct Image {
  pub id: i64,
  pub path: String,
  pub size_bytes: i64,
  pub content_hash: Vec<u8>,
  pub width: i64,
  pub height: i64,
  pub thumbnail_path: String,
  pub status: ImageStatus,
  pub retry_count: i64,
  pub error_message: String,
  pub created_at: String,
  pub updated_at: String,
}

impl Image {
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
      error_message: model.error_message.unwrap_or_default(),
      created_at: format_datetime(model.created_at),
      updated_at: format_datetime(model.updated_at),
    }
  }
}
