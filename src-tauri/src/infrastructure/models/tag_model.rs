use chrono::NaiveDateTime;
use sqlx::prelude::{FromRow, Type};

#[derive(Debug, PartialEq, Eq, Type)]
#[sqlx(type_name = "TEXT", rename_all = "lowercase")]
pub enum TagType {
  User,
  System,
  Deleted,
}

#[allow(dead_code)]
#[derive(Debug, FromRow)]
pub struct TagRow {
  pub id: i64,
  pub text: String,
  pub color: String,
  pub image_count: i64,
  pub tag_type: TagType,
  pub created_at: NaiveDateTime,
  pub updated_at: NaiveDateTime,
}
