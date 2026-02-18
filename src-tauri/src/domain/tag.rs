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

  pub fn normalize_color(color: &str) -> String {
    let trimmed = color.trim().trim_start_matches('#');

    // Expand 3-char hex (#abc → #aabbcc)
    let expanded = if trimmed.len() == 3 && trimmed.chars().all(|c| c.is_ascii_hexdigit()) {
      trimmed
        .chars()
        .map(|c| format!("{c}{c}"))
        .collect::<String>()
    } else {
      trimmed.to_string()
    };

    // Validate 6-digit hex
    if expanded.len() == 6 && expanded.chars().all(|c| c.is_ascii_hexdigit()) {
      format!("#{}", expanded.to_uppercase())
    } else {
      "#808080".to_string()
    }
  }
}
