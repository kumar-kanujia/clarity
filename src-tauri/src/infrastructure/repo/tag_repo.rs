use crate::{
  infrastructure::{
    models::tag_model::{TagItemRow, TagType},
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

  pub async fn delete_tag(&self, tag_id: i64) -> Result<(), DatabaseError> {
    let query_str = r#"
            DELETE FROM tags
            WHERE id = ?1
        "#;
    let result = sqlx::query(query_str)
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

  pub async fn get_tags_order_by_image_count(
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

#[cfg(test)]
mod tests {
  use super::*;

  use sqlx::SqlitePool;

  #[sqlx::test(migrations = "./migrations")]
  async fn test_create_tag(pool: SqlitePool) {
    let repo = TagRepository::new(pool);

    // Test creating a "Category" type tag
    let tag_id = repo
      .create_new_tag("Nature", "#00FF00", TagType::System)
      .await
      .expect("Failed to create tag");

    assert!(tag_id > 0);
  }

  #[sqlx::test(migrations = "./migrations")]
  async fn test_create_new_tag(pool: SqlitePool) {
    let repo = TagRepository::new(pool.clone());

    let tag_id = repo
      .create_new_tag("Nature", "#00FF00", TagType::User)
      .await
      .unwrap();

    let tag = sqlx::query_as::<_, TagItemRow>(
      r#"
        SELECT id, text, color, image_count
        FROM tags
        WHERE id = ?
      "#,
    )
    .bind(tag_id)
    .fetch_one(&pool)
    .await
    .unwrap();

    assert_eq!(tag.id, tag_id);
    assert_eq!(tag.text, "Nature");
    assert_eq!(tag.color, "#00FF00");
    assert_eq!(tag.image_count, 0);
  }

  #[sqlx::test(migrations = "./migrations")]
  async fn test_update_tag_partial(pool: SqlitePool) {
    let repo = TagRepository::new(pool.clone());

    // 1. Setup: Create a tag
    let tag_id = repo
      .create_new_tag("Original", "#FFFFFF", TagType::User)
      .await
      .unwrap();

    // 2. Update ONLY the text, keep the color
    repo
      .update_tag(tag_id, Some("Updated".into()), None)
      .await
      .unwrap();

    // 3. Verify
    let (text, color): (String, String) =
      sqlx::query_as::<_, (String, String)>("SELECT text, color FROM tags WHERE id = ?")
        .bind(tag_id)
        .fetch_one(&pool)
        .await
        .unwrap();

    assert_eq!(text, "Updated");
    assert_eq!(color, "#FFFFFF"); // Color should remain unchanged
  }

  #[sqlx::test(migrations = "./migrations")]
  async fn test_tag_not_found(pool: SqlitePool) {
    let repo = TagRepository::new(pool);

    // Try to update a tag ID that doesn't exist
    let result = repo.update_tag_type(999, TagType::Inactive).await;

    match result {
      Err(DatabaseError::NotFound) => (), // Success
      _ => panic!("Expected NotFound error, got {:?}", result),
    }
  }

  #[sqlx::test(migrations = "./migrations")]
  async fn test_get_popular_tags(pool: SqlitePool) {
    let repo = TagRepository::new(pool.clone());

    // 1. Setup: Insert tags with different image counts
    // (Ensure your migration has an image_count column, or update this manually)
    sqlx::query(
      "INSERT INTO tags (text, color, tag_type, image_count) VALUES ('A', '#FFFFFF', 'user', 100)",
    )
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query(
      "INSERT INTO tags (text, color, tag_type, image_count) VALUES ('B', '#FFFFFF', 'user', 50)",
    )
    .execute(&pool)
    .await
    .unwrap();

    // 2. Query popular tags
    let popular = repo
      .get_tags_order_by_image_count(TagType::User, Some(1))
      .await
      .unwrap();

    assert_eq!(popular.len(), 1);
    assert_eq!(popular[0].text, "A");
  }
}
