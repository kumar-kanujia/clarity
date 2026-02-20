use crate::{
  infrastructure::{
    models::tag_model::{TagItemRow, TagType},
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
            RETURNING id
        "#;
    let id = sqlx::query_scalar::<_, i64>(query_str)
      .bind(text)
      .bind(color)
      .bind(tag_type)
      .fetch_one(&self.db)
      .await?;
    Ok(id)
  }

  // endregion

  // region: Tag Mutate

  pub async fn update_tag(
    &self,
    tag_id: i64,
    tag_text: Option<String>,
    tag_color: Option<String>,
  ) -> Result<(), DatabaseError> {
    if tag_text.is_none() && tag_color.is_none() {
      return Ok(());
    }

    let result = sqlx::query(
      r#"
        UPDATE tags
        SET
            text = COALESCE(?1, text),
            color = COALESCE(?2, color)
        WHERE id = ?3
        "#,
    )
    .bind(tag_text)
    .bind(tag_color)
    .bind(tag_id)
    .execute(&self.db)
    .await?;

    if result.rows_affected() == 0 {
      return Err(DatabaseError::NotFound);
    }

    Ok(())
  }

  pub async fn update_tag_type(&self, tag_id: i64, tag_type: TagType) -> Result<(), DatabaseError> {
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
      return Err(DatabaseError::NotFound);
    }

    Ok(())
  }

  // endregion

  // region: Tag Query

  pub async fn get_popular_tags(
    &self,
    tag_type: TagType,
    limit: Option<i64>,
  ) -> Result<Vec<TagItemRow>, DatabaseError> {
    let rows = sqlx::query_as::<_, TagItemRow>(
      r#"
        SELECT id, text, color, image_count
        FROM tags
        WHERE tag_type = ?1
        ORDER BY image_count DESC
        LIMIT ?2
      "#,
    )
    .bind(tag_type)
    .bind(limit.unwrap_or(-1))
    .fetch_all(&self.db)
    .await?;

    Ok(rows)
  }
}
