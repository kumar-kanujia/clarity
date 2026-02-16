use crate::infrastructure::models::tag_model::TagRow;

use serde::Serialize;

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct TagDto {
  pub id: i64,
  pub tag_name: String,
  pub tag_color: String,
  pub image_count: i64,
}

impl From<TagRow> for TagDto {
  fn from(tag_row: TagRow) -> Self {
    Self {
      id: tag_row.id,
      tag_name: tag_row.text,
      tag_color: tag_row.color,
      image_count: tag_row.image_count,
    }
  }
}
