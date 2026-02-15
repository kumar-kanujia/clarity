#[allow(clippy::needless_raw_strings)]
use crate::{
  domain::{
    file::FileMetaData,
    image::{Image, MAX_WORKER_RETRIES},
  },
  infrastructure::{
    models::image_model::{ImageRow, ImageStatus},
    repo::error::DatabaseError,
  },
  interface::dto::ImageCursor,
  setup::state::Db,
};

use sqlx::QueryBuilder;

#[derive(Clone, Debug)]
pub struct ImageRepository {
  db: Db,
}

impl ImageRepository {
  pub fn new(db: Db) -> Self {
    Self { db }
  }

  pub async fn create_images_by_file_metadata(
    &self,
    files: &[FileMetaData],
  ) -> Result<u64, DatabaseError> {
    if files.is_empty() {
      return Ok(0);
    }

    let mut query_builder =
      QueryBuilder::new("INSERT OR IGNORE INTO images (path, size_bytes, created_at) ");

    query_builder.push_values(files, |mut b, file| {
      b.push_bind(&file.path)
        .push_bind(file.size_bytes)
        .push_bind(&file.created_at);
    });

    let result = query_builder.build().execute(&self.db).await?;
    Ok(result.rows_affected())
  }

  pub async fn list_images_paginated(
    &self,
    limit: i64,
    cursor: Option<ImageCursor>,
  ) -> Result<Vec<ImageRow>, DatabaseError> {
    let mut query_builder = QueryBuilder::new("SELECT * FROM images");

    if let Some(cursor) = cursor {
      query_builder.push(" WHERE (created_at, id) < (");
      query_builder.push_bind(cursor.created_at);
      query_builder.push(", ");
      query_builder.push_bind(cursor.id);
      query_builder.push(")");
    }

    query_builder.push(" ORDER BY created_at DESC, id DESC LIMIT ");
    query_builder.push_bind(limit);

    let result = query_builder
      .build_query_as::<ImageRow>()
      .fetch_all(&self.db)
      .await?;

    Ok(result)
  }

  pub async fn list_images_by_status(
    &self,
    limit: i64,
    process_status: ImageStatus,
  ) -> Result<Vec<ImageRow>, DatabaseError> {
    let result = sqlx::query_as::<_, ImageRow>(
      r#"
        SELECT * FROM images
        WHERE status = ?1 AND retry_count < ?2
        LIMIT ?3
      "#,
    )
    .bind(process_status)
    .bind(MAX_WORKER_RETRIES)
    .bind(limit)
    .fetch_all(&self.db)
    .await?;

    Ok(result)
  }

  pub async fn update_images_hash(&self, updates: &[Image]) -> Result<u64, DatabaseError> {
    if updates.is_empty() {
      return Ok(0);
    }

    let mut tx = self.db.begin().await?;
    let mut total_updated = 0;

    let query_str = r#"
            UPDATE images
            SET
              content_hash = ?1,
              status = ?2,
              retry_count = ?3,
              error_message = ?4
            WHERE id = ?5
        "#;

    for update in updates {
      let result = sqlx::query(query_str)
        .bind(&update.content_hash)
        .bind(update.status)
        .bind(update.retry_count)
        .bind(&update.error_message)
        .bind(update.id)
        .execute(&mut *tx)
        .await?;
      total_updated += result.rows_affected();
    }

    tx.commit().await?;
    Ok(total_updated)
  }

  pub async fn update_images_metadata(&self, updates: &[Image]) -> Result<u64, DatabaseError> {
    if updates.is_empty() {
      return Ok(0);
    }

    let mut tx = self.db.begin().await?;
    let mut total_updated = 0;

    let query_str = r#"
              UPDATE images
              SET
                width = ?1,
                height = ?2,
                thumbnail_path = ?3,
                status = ?4,
                retry_count = ?5,
                error_message = ?6
              WHERE id = ?7
            "#;

    for update in updates {
      let result = sqlx::query(query_str)
        .bind(update.width)
        .bind(update.height)
        .bind(&update.thumbnail_path)
        .bind(update.status)
        .bind(update.retry_count)
        .bind(&update.error_message)
        .bind(update.id)
        .execute(&mut *tx)
        .await?;

      total_updated += result.rows_affected();
    }

    tx.commit().await?;
    Ok(total_updated)
  }

  pub async fn list_images_grouped_by_hash(
    &self,
    limit: i64,
    cursor_id: Option<i64>,
  ) -> Result<Vec<ImageRow>, DatabaseError> {
    let where_clause = if cursor_id.is_some() {
      "WHERE content_hash > COALESCE((SELECT content_hash FROM images WHERE id = ?), x'') AND content_hash IS NOT NULL"
    } else {
      "WHERE content_hash IS NOT NULL"
    };

    let query = format!(
      r#"
              SELECT *
              FROM images
              WHERE content_hash IN (
                  SELECT content_hash
                  FROM images
                  {where_clause}
                  GROUP BY content_hash
                  HAVING COUNT(*) > 1
                  ORDER BY content_hash ASC
                  LIMIT ?
              )
              ORDER BY content_hash ASC, created_at ASC;
              "#
    );

    let mut q = sqlx::query_as::<_, ImageRow>(&query);

    if let Some(id) = cursor_id {
      q = q.bind(id);
    }

    q = q.bind(limit);

    let result = q.fetch_all(&self.db).await?;
    Ok(result)
  }
}
