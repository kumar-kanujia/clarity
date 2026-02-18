use crate::{
  infrastructure::{
    models::tag_model::{TagRow, TagType},
    repo::error::DatabaseError,
  },
  state::Db,
};

#[derive(Debug, Clone)]
pub struct TagRepository {
  db: Db,
}

impl TagRepository {
  pub fn new(db: Db) -> Self {
    Self { db }
  }

  // region: Tag Create

  pub async fn create_new_tag(
    &self,
    text: &str,
    color: &str,
    tag_type: TagType,
  ) -> Result<i64, DatabaseError> {
    let query_str = r#"
            INSERT INTO tags (text, color, tag_type)
            VALUES (?1, ?2, ?3)
        "#;
    let result = sqlx::query(query_str)
      .bind(text)
      .bind(color)
      .bind(tag_type)
      .execute(&self.db)
      .await?;

    Ok(result.last_insert_rowid())
  }

  // endregion

  // region: Tag Mutate

  pub async fn update_tag_tag_type(
    &self,
    tag_id: i64,
    tag_type: TagType,
  ) -> Result<(), DatabaseError> {
    let query_str = r#"
            UPDATE tags
            SET tag_type = ?1
            WHERE id = ?2
        "#;
    let result = sqlx::query(query_str)
      .bind(tag_type)
      .bind(tag_id)
      .execute(&self.db)
      .await?;

    if result.rows_affected() == 0 {
      return Err(DatabaseError::NotFound(format!(
        "Tag with id {} not found",
        tag_id
      )));
    }

    Ok(())
  }

  // endregion

  // region: Tag Query

  pub async fn get_tags_order_by_image_count(
    &self,
    tag_type: TagType,
    limit: i64,
  ) -> Result<Vec<TagRow>, DatabaseError> {
    let query_str = r#"
            SELECT *
            FROM tags
            WHERE tag_type = ?1
            ORDER BY image_count DESC
            LIMIT ?2
        "#;
    let row = sqlx::query_as::<_, TagRow>(query_str)
      .bind(tag_type)
      .bind(limit)
      .fetch_all(&self.db)
      .await?;

    Ok(row)
  }
}
