use crate::{
  domain::image::Image,
  infrastructure::{models::image_model::ImageItemRow, utils::format_datetime},
};

use serde::{Deserialize, Serialize};

// region: Import DTOs

#[derive(Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportSummary {
  pub total_scanned: i64,
  pub total_imported: i64,
  pub failed: i64,
  pub skipped: i64,
}

impl ImportSummary {
  pub fn build(
    total_scanned: i64,
    walk_errors: i64,
    metadata_count: i64,
    total_imported: i64,
  ) -> Self {
    let extraction_failures = total_scanned - walk_errors - metadata_count;
    let total_failed = walk_errors + extraction_failures;
    Self {
      total_scanned,
      total_imported,
      failed: total_failed,
      skipped: metadata_count - total_imported,
    }
  }
}

// endregion

// region: Image Query DTOs

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ImageItemResult {
  pub data: Vec<ImageItem>,
  pub next_cursor: Option<CreatedAtCursor>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CreatedAtCursor {
  pub created_at: String,
  pub id: i64,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ImageItem {
  pub id: i64,
  pub file_name: String,
  pub file_path: String,
  pub size: String,
  pub resolution: String,
  pub thumbnail_path: String,
  pub created_at: String,
  pub is_favorite: bool,
}

impl From<ImageItemRow> for ImageItem {
  fn from(row: ImageItemRow) -> Self {
    let width = row.width.unwrap_or_default();
    let height = row.height.unwrap_or_default();
    Self {
      id: row.id,
      file_name: row.file_name,
      file_path: row.path,
      size: Image::make_size_string(row.size_bytes),
      resolution: Image::make_resolution_string(width, height),
      thumbnail_path: row.thumbnail_path.unwrap_or_default(),
      created_at: format_datetime(row.created_at),
      is_favorite: row.is_favorite,
    }
  }
}
