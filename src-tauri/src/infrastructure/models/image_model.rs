use chrono::NaiveDateTime;
use sqlx::prelude::{FromRow, Type};

#[derive(Debug, Type, Default, PartialEq, Eq)]
#[repr(i32)]
pub enum ImageStatus {
  #[default]
  Pending = 0,
  Hashed = 1,
  Thumbnailed = 2,
}

#[derive(Debug, FromRow)]
pub struct ImageRow {
  pub id: i64,
  pub file_name: String,
  pub path: String,
  pub size_bytes: i64,
  pub content_hash: Option<Vec<u8>>,
  pub width: Option<i64>,
  pub height: Option<i64>,
  pub thumbnail_path: Option<String>,
  pub status: ImageStatus,
  pub retry_count: i64,
  pub error_message: Option<String>,
  pub created_at: NaiveDateTime,
  pub updated_at: NaiveDateTime,
  pub is_favorite: bool,
  pub is_deleted: bool,
}

#[derive(Debug, FromRow)]
pub struct ImageItemRow {
  pub id: i64,
  pub file_name: String,
  pub path: String,
  pub size_bytes: i64,
  pub width: Option<i64>,
  pub height: Option<i64>,
  pub thumbnail_path: Option<String>,
  pub created_at: NaiveDateTime,
  pub is_favorite: bool,
}
