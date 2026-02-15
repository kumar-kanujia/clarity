use crate::infrastructure::models::tag_model::TagType;

#[allow(dead_code)]
pub struct Tag {
  pub id: i64,
  pub text: String,
  pub color: String,
  pub image_count: i64,
  pub tag_type: TagType,
  pub created_at: String,
  pub updated_at: String,
}

impl Tag {
  pub fn normalize_text(text: &str) -> String {
    text
      .to_ascii_lowercase()
      .split_whitespace()
      .collect::<Vec<&str>>()
      .join("-")
  }
}
