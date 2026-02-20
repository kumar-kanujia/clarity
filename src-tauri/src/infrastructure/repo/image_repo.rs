#[allow(clippy::needless_raw_strings)]
use crate::{
  domain::{file::FileMetaData, image::Image},
  infrastructure::{
    models::image_model::{ImageRow, ImageStatus},
    repo::error::DatabaseError,
  },
  state::Db,
};
use crate::{
  infrastructure::models::image_model::ImageItemRow, interface::dtos::image_dto::CreatedAtCursor,
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

  // region: Image Create

  pub async fn create_images_by_file_metadata(
    &self,
    files: &[FileMetaData],
  ) -> Result<i64, DatabaseError> {
    if files.is_empty() {
      return Ok(0);
    }

    const CHUNK_SIZE: usize = 5000;

    let mut tx = self.db.begin().await?;
    let mut total_inserted = 0;

    for chunk in files.chunks(CHUNK_SIZE) {
      let mut query_builder = QueryBuilder::new(
        "INSERT OR IGNORE INTO images (path, file_name, size_bytes, created_at) ",
      );

      query_builder.push_values(chunk, |mut b, file| {
        b.push_bind(&file.path)
          .push_bind(&file.file_name)
          .push_bind(file.size_bytes)
          .push_bind(&file.created_at);
      });

      let result = query_builder.build().execute(&mut *tx).await?;
      total_inserted += result.rows_affected();
    }

    tx.commit().await?;

    Ok(total_inserted as i64)
  }

  // endregion

  // region: Image Update

  pub async fn update_images_content_hash(&self, updates: &[Image]) -> Result<u64, DatabaseError> {
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
        .bind(&update.status)
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

  pub async fn update_image_metadata(&self, updates: &[Image]) -> Result<u64, DatabaseError> {
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
        .bind(&update.status)
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

  pub async fn toggle_image_favorite(&self, image_id: i64) -> Result<bool, DatabaseError> {
    let result = sqlx::query_scalar::<_, i64>(
      r#"
            UPDATE images
            SET is_favorite = NOT is_favorite
            WHERE id = ?1
            RETURNING is_favorite
      "#,
    )
    .bind(image_id)
    .fetch_optional(&self.db)
    .await?;

    match result {
      Some(is_fav) => Ok(is_fav == 1),
      None => Err(DatabaseError::NotFound),
    }
  }

  pub async fn set_image_deleted_status(
    &self,
    image_id: i64,
    is_deleted: bool,
  ) -> Result<(), DatabaseError> {
    let image_result = sqlx::query(
      r#"
            UPDATE images
            SET is_deleted = ?1
            WHERE id = ?2
      "#,
    )
    .bind(is_deleted)
    .bind(image_id)
    .execute(&self.db)
    .await?;

    if image_result.rows_affected() == 0 {
      return Err(DatabaseError::NotFound);
    }

    Ok(())
  }

  // endregion

  // region: Image Query

  pub async fn get_images_for_processing(
    &self,
    limit: i64,
    max_retry_count: i64,
    process_status: ImageStatus,
  ) -> Result<Vec<ImageRow>, DatabaseError> {
    let result = sqlx::query_as::<_, ImageRow>(
      r#"
        SELECT 
          id, file_name, path, size_bytes, content_hash, 
          width, height, thumbnail_path, status, retry_count, 
          error_message, created_at, updated_at, is_favorite, is_deleted
        FROM images
        WHERE status = ?1 AND retry_count < ?2
        ORDER BY created_at ASC
        LIMIT ?3
      "#,
    )
    .bind(process_status)
    .bind(max_retry_count)
    .bind(limit)
    .fetch_all(&self.db)
    .await?;

    Ok(result)
  }

  pub async fn get_images_paginated(
    &self,
    limit: i64,
    is_deleted: bool,
    is_favorite: Option<bool>,
    cursor: Option<CreatedAtCursor>,
  ) -> Result<Vec<ImageItemRow>, DatabaseError> {
    let mut qb = QueryBuilder::new(
      r#" 
        SELECT 
          id, file_name, path, size_bytes, width,
          height, thumbnail_path, created_at, is_favorite 
        FROM images
        WHERE is_deleted = 
    "#,
    );

    qb.push_bind(is_deleted);

    if let Some(is_favorite) = is_favorite {
      qb.push(" AND is_favorite = ");
      qb.push_bind(is_favorite);
    }

    if let Some(cursor) = cursor {
      qb.push(" AND (created_at, id) < (");
      qb.push_bind(cursor.created_at);
      qb.push(", ");
      qb.push_bind(cursor.id);
      qb.push(")");
    }

    qb.push(" ORDER BY created_at DESC, id DESC LIMIT ");
    qb.push_bind(limit);

    let result = qb
      .build_query_as::<ImageItemRow>()
      .fetch_all(&self.db)
      .await?;

    Ok(result)
  }

  pub async fn get_images_by_tag_paginated(
    &self,
    tag_id: i64,
    limit: i64,
    cursor: Option<CreatedAtCursor>,
  ) -> Result<Vec<ImageItemRow>, DatabaseError> {
    let mut qb = QueryBuilder::new(
      r#" 
        SELECT 
          id, file_name, path, size_bytes, width,
          height, thumbnail_path, images.created_at, is_favorite 
        FROM images
        JOIN image_tags ON images.id = image_tags.image_id
        WHERE image_tags.tag_id = 
    "#,
    );
    qb.push_bind(tag_id);
    qb.push(" AND is_deleted = 0");

    if let Some(cursor) = cursor {
      qb.push(" AND (image_tags.created_at, images.id) < (");
      qb.push_bind(cursor.created_at);
      qb.push(", ");
      qb.push_bind(cursor.id);
      qb.push(")");
    }

    qb.push(" ORDER BY image_tags.created_at DESC, id DESC LIMIT");
    qb.push_bind(limit);

    let result = qb
      .build_query_as::<ImageItemRow>()
      .fetch_all(&self.db)
      .await?;

    Ok(result)
  }
}
