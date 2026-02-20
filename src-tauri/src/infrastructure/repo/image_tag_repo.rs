use crate::{
  infrastructure::{
    models::tag_model::{TagRow, TagType},
    repo::error::DatabaseError,
  },
  state::Db,
};

pub struct ImageTagRepository {
  db: Db,
}

impl ImageTagRepository {
  pub fn new(db: Db) -> Self {
    Self { db }
  }

  // region: Tag Create

  pub async fn create_or_delete_image_tag(
    &self,
    image_id: i64,
    tag_id: i64,
  ) -> Result<bool, DatabaseError> {
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
  ) -> Result<Vec<TagRow>, DatabaseError> {
    let mut qb = sqlx::QueryBuilder::new(
      r#"
      SELECT tags.*
      FROM tags
      JOIN image_tags ON tags.id = image_tags.tag_id"#,
    );

    qb.push(" WHERE image_tags.image_id = ");
    qb.push_bind(image_id);

    qb.push(" AND tags.tag_type = ");
    qb.push_bind(tag_type);

    qb.push("ORDER BY tags.image_count DESC");

    if let Some(limit) = limit {
      qb.push(" LIMIT ");
      qb.push_bind(limit);
    }

    let rows = qb.build_query_as::<TagRow>().fetch_all(&self.db).await?;

    Ok(rows)
  }

  pub async fn get_tags_not_attached_to_image(
    &self,
    image_id: i64,
    tag_type: TagType,
    limit: Option<i64>,
  ) -> Result<Vec<TagRow>, DatabaseError> {
    let mut qb = sqlx::QueryBuilder::new(
      r#"
      SELECT tags.*
      FROM tags
      WHERE NOT EXISTS (
          SELECT 1
          FROM image_tags
          WHERE image_tags.tag_id = tags.id
          AND image_tags.image_id = 
      "#,
    );

    qb.push_bind(image_id);
    qb.push(")");

    qb.push(" AND tags.tag_type = ");
    qb.push_bind(tag_type);

    qb.push(" ORDER BY tags.image_count DESC");

    if let Some(limit) = limit {
      qb.push(" LIMIT ");
      qb.push_bind(limit);
    }

    let rows = qb.build_query_as::<TagRow>().fetch_all(&self.db).await?;

    Ok(rows)
  }
}
