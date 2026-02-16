use crate::{infrastructure::repo::error::DatabaseError, state::Db};

#[derive(Debug, Clone)]
pub struct ImageTagRepository {
  db: Db,
}

impl ImageTagRepository {
  pub fn new(db: Db) -> Self {
    Self { db }
  }

  pub async fn insert_tag_image(&self, image_id: i64, tag_id: i64) -> Result<u64, DatabaseError> {
    let sql = r#"INSERT OR IGNORE INTO image_tags (image_id, tag_id)  VALUES (?1, ?2)"#;

    let res = sqlx::query(sql)
      .bind(image_id)
      .bind(tag_id)
      .execute(&self.db)
      .await?;

    Ok(res.rows_affected())
  }

  pub async fn delete_tag_image(&self, image_id: i64, tag_id: i64) -> Result<u64, DatabaseError> {
    let sql = r#"DELETE FROM image_tags WHERE image_id = ?1 AND tag_id = ?2"#;

    let res = sqlx::query(sql)
      .bind(image_id)
      .bind(tag_id)
      .execute(&self.db)
      .await?;

    Ok(res.rows_affected())
  }
}
