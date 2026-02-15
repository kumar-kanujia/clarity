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

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_normalize_text_lowercase() {
    assert_eq!(Tag::normalize_text("HELLO"), "hello");
    assert_eq!(Tag::normalize_text("HeLLo WoRLd"), "hello-world");
  }

  #[test]
  fn test_normalize_text_with_spaces() {
    assert_eq!(Tag::normalize_text("hello world"), "hello-world");
    assert_eq!(Tag::normalize_text("one two three"), "one-two-three");
  }

  #[test]
  fn test_normalize_text_multiple_spaces() {
    assert_eq!(Tag::normalize_text("hello  world"), "hello-world");
    assert_eq!(Tag::normalize_text("hello   world"), "hello-world");
    assert_eq!(Tag::normalize_text("  hello world  "), "hello-world");
  }

  #[test]
  fn test_normalize_text_single_word() {
    assert_eq!(Tag::normalize_text("tag"), "tag");
    assert_eq!(Tag::normalize_text("TAG"), "tag");
  }

  #[test]
  fn test_normalize_text_empty() {
    assert_eq!(Tag::normalize_text(""), "");
    assert_eq!(Tag::normalize_text("   "), "");
  }

  #[test]
  fn test_normalize_text_tabs_and_newlines() {
    assert_eq!(Tag::normalize_text("hello\tworld"), "hello-world");
    assert_eq!(Tag::normalize_text("hello\nworld"), "hello-world");
    assert_eq!(Tag::normalize_text("hello\r\nworld"), "hello-world");
  }

  #[test]
  fn test_normalize_text_preserves_hyphens_as_separate_words() {
    assert_eq!(Tag::normalize_text("already-hyphenated"), "already-hyphenated");
  }
}