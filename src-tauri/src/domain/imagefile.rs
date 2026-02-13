use serde::{Deserialize, Serialize};
use sqlx::{FromRow, prelude::Type};

use crate::application::dtos::Image;

#[derive(Debug, Serialize, Deserialize, Clone, Copy, Type, Default, PartialEq, Eq)]
#[repr(i32)]
pub enum ProcessStatus {
  #[default]
  Pending = 0,
  Hashed = 1,
  Complete = 2,
  Error = 3,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Default, Clone)]
pub struct ImageFile {
  pub seq_id: i64,
  pub file_path: String,
  pub file_size: i64,
  pub thumbnail_path: String,
  pub dim_x: u32,
  pub dim_y: u32,
  pub process_status: ProcessStatus,
  pub ctx: i64,
  pub mtx: i64,
  pub updated_at: i64,
  pub file_hash: Vec<u8>,
}

impl ImageFile {
  pub fn dimensions_string(&self) -> String {
    format!("{}x{}", self.dim_x, self.dim_y)
  }

  pub fn size_string(&self) -> String {
    const KB: f64 = 1_000.0;
    const MB: f64 = 1_000_000.0;
    const GB: f64 = 1_000_000_000.0;

    #[allow(clippy::cast_precision_loss)]
    let bytes = self.file_size as f64;

    let (value, unit) = if bytes < MB {
      (bytes / KB, "KB")
    } else if bytes < GB {
      (bytes / MB, "MB")
    } else {
      (bytes / GB, "GB")
    };

    format!("{value:.2} {unit}")
  }

  pub fn group_by_hash(image_files: Vec<ImageFile>) -> Vec<Vec<Image>> {
    if image_files.is_empty() {
      return Vec::new();
    }

    let mut grouped_images = Vec::new();
    let mut current_group = Vec::new();
    let mut curr_hash: Option<Vec<u8>> = None;

    for image_file in image_files {
      if image_file.file_hash.is_empty() {
        continue;
      }

      if let Some(ref h) = curr_hash
        && *h != image_file.file_hash
      {
        grouped_images.push(current_group);
        current_group = Vec::new();
        curr_hash = Some(image_file.file_hash.clone());
      } else {
        curr_hash = Some(image_file.file_hash.clone());
      }
      current_group.push(image_file.into());
    }
    if !current_group.is_empty() {
      grouped_images.push(current_group);
    }

    grouped_images
  }
}
