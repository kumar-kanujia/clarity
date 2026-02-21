use crate::{
  infrastructure::{
    models::tag_model::{TagItemRow, TagType},
    repo::error::DatabaseError,
  },
  setup::state::Db,
};

pub struct ImageTagRepository {
  db: Db,
}

impl ImageTagRepository {
  pub fn new(db: Db) -> Self {
    Self { db }
  }

  // region: Tag Create

  pub async fn toggle_image_tag(&self, image_id: i64, tag_id: i64) -> Result<bool, DatabaseError> {
    let mut tx = self.db.begin().await?;

    let delete_res = sqlx::query("DELETE FROM image_tags WHERE image_id = ?1 AND tag_id = ?2")
      .bind(image_id)
      .bind(tag_id)
      .execute(&mut *tx)
      .await?;

    if delete_res.rows_affected() > 0 {
      tx.commit().await?;
      return Ok(false);
    }

    let insert_res = sqlx::query("INSERT INTO image_tags (image_id, tag_id) VALUES (?1, ?2)")
      .bind(image_id)
      .bind(tag_id)
      .execute(&mut *tx)
      .await?;

    tx.commit().await?;

    Ok(insert_res.rows_affected() == 1)
  }

  // endregion

  // region: Tag Query

  pub async fn get_tags_attached_to_image(
    &self,
    image_id: i64,
    tag_type: TagType,
    limit: Option<i64>,
  ) -> Result<Vec<TagItemRow>, DatabaseError> {
    let rows = sqlx::query_as::<_, TagItemRow>(
      r#"
      SELECT tags.id, tags.text, tags.color, tags.image_count
      FROM tags
      JOIN image_tags ON tags.id = image_tags.tag_id
      WHERE image_tags.image_id = ?1
        AND tags.tag_type = ?2
      ORDER BY tags.image_count DESC
      LIMIT ?3
      "#,
    )
    .bind(image_id)
    .bind(tag_type)
    .bind(limit.unwrap_or(-1))
    .fetch_all(&self.db)
    .await?;

    Ok(rows)
  }

  pub async fn get_tags_not_attached_to_image(
    &self,
    image_id: i64,
    tag_type: TagType,
    limit: Option<i64>,
  ) -> Result<Vec<TagItemRow>, DatabaseError> {
    let rows = sqlx::query_as::<_, TagItemRow>(
      r#"
      SELECT tags.id, tags.text, tags.color, tags.image_count
      FROM tags
      WHERE tags.tag_type = ?1
        AND NOT EXISTS (
            SELECT 1
            FROM image_tags
            WHERE image_tags.tag_id = tags.id
              AND image_tags.image_id = ?2
        )
      ORDER BY tags.image_count DESC
      LIMIT ?3
      "#,
    )
    .bind(tag_type)
    .bind(image_id)
    .bind(limit.unwrap_or(-1)) // The magic SQLite trick to bypass the limit if None
    .fetch_all(&self.db)
    .await?;

    Ok(rows)
  }
}
