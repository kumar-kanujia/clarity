use serde::{Deserialize, Serialize};

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize)]
pub struct GalleryNextCursor {
  pub last_created_at: String,
  pub last_image_id: i64,
}

#[derive(Debug, Serialize)]
pub struct GalleryImageDTO {
  pub image_id: i64,
  pub image_name: String,
  pub image_path: String,
  pub thumbnail_path: String,
  pub image_size: String,
  pub image_dimensions: String,
  pub created_at: String,
  pub is_favorite: bool,
}

#[derive(Debug, Serialize)]
pub struct GalleryBlock {
  pub section: String,
  pub images: Vec<GalleryImageDTO>,
}

#[derive(Debug, Serialize)]
pub struct GalleryDto {
  data: GalleryBlock,
  next_cursor: Option<GalleryNextCursor>,
}
