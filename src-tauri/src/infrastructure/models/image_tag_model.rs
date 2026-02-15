use chrono::NaiveDateTime;
use sqlx::prelude::FromRow;

#[allow(dead_code)]
#[derive(Debug, FromRow)]
pub struct ImageTagRow {
  pub image_id: i64,
  pub tag_id: i64,
  pub created_at: NaiveDateTime,
}
