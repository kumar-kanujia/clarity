use crate::infrastructure::models::tag_model::TagType;

pub struct Tag {
  pub id: i64,
  pub text: String,
  pub color: String,
  pub image_count: i64,
  pub tag_type: TagType,
  pub is_deleted: i64,
  pub is_hidden: i64,
  pub created_at: String,
  pub updated_at: String,
}
