use crate::{
  infrastructure::{
    models::tag_model::{TagRow, TagType},
    repo::error::DatabaseError,
  },
  setup::state::Db,
};

#[derive(Debug, Clone)]
pub struct TagRepository {
  db: Db,
}

impl TagRepository {
  pub fn new(db: Db) -> Self {
    Self { db }
  }

  pub async fn save_new_tag(&self, text: &str, tag_type: TagType) -> Result<i64, DatabaseError> {
    let query_str = r#"
            INSERT INTO tags (text, tag_type)
            VALUES (?1, ?2)
        "#;
    let result = sqlx::query(query_str)
      .bind(text)
      .bind(tag_type)
      .execute(&self.db)
      .await?;

    Ok(result.last_insert_rowid())
  }

  pub async fn list_tags(&self, tag_type: TagType) -> Result<Vec<TagRow>, DatabaseError> {
    let query_str = r#"
            SELECT *
            FROM tags
            WHERE tag_type = ?
        "#;
    let row = sqlx::query_as::<_, TagRow>(query_str)
      .bind(tag_type)
      .fetch_all(&self.db)
      .await?;

    Ok(row)
  }
}
