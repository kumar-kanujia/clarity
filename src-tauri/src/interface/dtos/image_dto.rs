use crate::{
  domain::image::Image,
  infrastructure::{models::image_model::GalleryImageRow, system::format_datetime},
  interface::dtos::SearchOrderBy,
};

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ImageSearchCursor {
  pub last_value: String,
  pub id: i64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ImageFilters {
  pub file_names: Vec<String>,
  pub tag_ids: Vec<i64>,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum ImageSortBy {
  FileName,
  Size,
  CreatedAt,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ImageSearchQuery {
  pub filters: ImageFilters,
  pub sort_by: Option<ImageSortBy>,
  pub order: Option<SearchOrderBy>,
  pub limit: i64,
}

#[derive(Serialize)]
pub struct ImageSearchResult {
  pub next_cursor: Option<ImageSearchCursor>,
  pub data: Vec<ImageDto>,
}

#[derive(Serialize)]
pub struct PaginatedImageHashGroups {
  pub data: Vec<Vec<ImageDto>>,
  pub next_cursor: Option<i64>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedImages {
  pub data: Vec<ImageDto>,
  pub next_cursor: Option<ImageCursor>,
}

#[derive(Serialize, Deserialize, Default, Debug)]
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
  pub file_name: String,
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
      file_name: image.file_name,
      path: image.path,
      created_at: image.created_at,
      thumbnail_path: image.thumbnail_path,
    }
  }
}

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ImportSummaryDto {
  pub total_scanned: i64,
  pub total_imported: i64,
  pub failed: i64,
  pub skipped: i64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GalleryImageResult {
  pub data: Vec<GalleryImage>,
  pub next_cursor: Option<ImageCursor>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GalleryImage {
  pub image_id: i64,
  pub file_name: String,
  pub image_path: String,
  pub image_size: String,
  pub resolution: String,
  pub thumbnail_path: String,
  pub created_at: String,
  pub is_favorite: bool,
}

impl From<GalleryImageRow> for GalleryImage {
  fn from(row: GalleryImageRow) -> Self {
    let width = row.width.unwrap_or_default();
    let height = row.height.unwrap_or_default();
    Self {
      image_id: row.id,
      file_name: row.file_name,
      image_path: row.path,
      image_size: Image::make_size_string(row.size_bytes),
      resolution: Image::make_resolution_string(width, height),
      thumbnail_path: row.thumbnail_path.unwrap_or_default(),
      created_at: format_datetime(row.created_at),
      is_favorite: row.is_favorite == 1,
    }
  }
}
