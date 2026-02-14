use serde::{Deserialize, Serialize};

use crate::domain::{image::Image, import_summary::ImportSummary};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedImages {
  pub data: Vec<ImageDto>,
  pub next_cursor: Option<ImageCursor>,
}

#[derive(Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ImageCursor {
  pub created_at: String,
  pub id: i64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageDto {
  pub id: i64,
  pub path: String,
  pub size: String,
  pub resolution: String,
  pub thumbnail_path: String,
  pub created_at: String,
}

impl From<Image> for ImageDto {
  fn from(image: Image) -> Self {
    Self {
      size: image.size_string(),
      resolution: image.resolution(),
      id: image.id as i64,
      path: image.path,
      created_at: image.created_at,
      thumbnail_path: image.thumbnail_path,
    }
  }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportSummaryDto {
  pub total_scanned: i64,
  pub total_imported: i64,
  pub failed: i64,
  pub skipped: i64,
}

impl From<ImportSummary> for ImportSummaryDto {
  fn from(summary: ImportSummary) -> Self {
    Self {
      total_scanned: summary.discovered,
      total_imported: summary.imported,
      skipped: summary.skipped,
      failed: summary.get_failed(),
    }
  }
}
