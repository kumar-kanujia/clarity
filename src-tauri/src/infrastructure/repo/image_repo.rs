use std::collections::HashSet;

#[allow(clippy::needless_raw_strings)]
use crate::{
  domain::{file::FileMetaData, image::Image},
  infrastructure::{
    models::image_model::{ImageItemRow, ImageRow, ImageStatus},
    repo::error::DatabaseError,
  },
  interface::dtos::image_dto::CreatedAtCursor,
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

  // region: Image Create

  pub async fn create_images_by_file_metadata(
    &self,
    files: &[FileMetaData],
  ) -> Result<u64, DatabaseError> {
    if files.is_empty() {
      return Ok(0);
    }

    const CHUNK_SIZE: usize = 200;

    let mut tx = self.db.begin().await?;

    let mut total_inserted = 0;

    for chunk in files.chunks(CHUNK_SIZE) {
      let mut qb = QueryBuilder::new(
        "INSERT OR IGNORE INTO images (path, file_name, size_bytes, created_at) ",
      );

      qb.push_values(chunk, |mut b, file| {
        b.push_bind(&file.path)
          .push_bind(&file.file_name)
          .push_bind(file.size_bytes)
          .push_bind(&file.created_at);
      });

      let result = qb.build().execute(&mut *tx).await?;

      total_inserted += result.rows_affected();
    }

    tx.commit().await?;

    Ok(total_inserted)
  }

  // endregion

  // region: Image Update

  pub async fn delete_images(&self, image_ids: &[i64]) -> Result<u64, DatabaseError> {
    if image_ids.is_empty() {
      return Ok(0);
    }

    let mut tx = self.db.begin().await?;

    let mut qb = QueryBuilder::new("DELETE FROM images WHERE id IN (");

    let mut separated = qb.separated(", ");

    for id in image_ids {
      separated.push_bind(id);
    }

    separated.push_unseparated(")");

    let result = qb.build().execute(&mut *tx).await?;

    tx.commit().await?;

    Ok(result.rows_affected())
  }

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

  pub async fn update_image_status_deleted_all(&self) -> Result<u64, DatabaseError> {
    let mut tx = self.db.begin().await?;

    let mut qb = QueryBuilder::new("UPDATE images SET status = ");

    qb.push_bind(ImageStatus::Deleted);

    qb.push(" WHERE is_deleted = 1");

    let result = qb.build().execute(&mut *tx).await?;

    tx.commit().await?;

    Ok(result.rows_affected())
  }

  pub async fn update_image_status(
    &self,
    image_ids: &[i64],
    status: ImageStatus,
  ) -> Result<u64, DatabaseError> {
    let mut tx = self.db.begin().await?;

    let mut qb = QueryBuilder::new("UPDATE images SET status = ");

    qb.push_bind(status);

    qb.push("WHERE is_deleted = 1 AND id IN (");

    let mut separated = qb.separated(", ");

    for id in image_ids {
      separated.push_bind(id);
    }

    qb.push(")");

    let result = qb.build().execute(&mut *tx).await?;

    tx.commit().await?;

    Ok(result.rows_affected())
  }

  pub async fn update_image_deleted_status(
    &self,
    image_ids: Vec<i64>,
    is_deleted: bool,
  ) -> Result<u64, DatabaseError> {
    let mut tx = self.db.begin().await?;

    let mut qb = QueryBuilder::new("UPDATE images SET is_deleted = ");

    qb.push_bind(is_deleted);

    qb.push("WHERE id IN (");

    let mut separated = qb.separated(", ");

    for id in image_ids {
      separated.push_bind(id);
    }

    qb.push(")");

    let result = qb.build().execute(&mut *tx).await?;

    if result.rows_affected() == 0 {
      return Err(DatabaseError::NotFound);
    }

    tx.commit().await?;

    Ok(result.rows_affected())
  }

  // endregion

  // region: Image Query

  pub async fn get_images_by_hashes_and_status(
    &self,
    hashes: &HashSet<Vec<u8>>,
    status: ImageStatus,
  ) -> Result<Vec<ImageRow>, DatabaseError> {
    if hashes.is_empty() {
      return Ok(Vec::new());
    }

    let mut qb = QueryBuilder::new("SELECT * FROM images WHERE content_hash IN (");

    let mut separated = qb.separated(", ");

    for hash in hashes {
      separated.push_bind(hash);
    }

    separated.push_unseparated(") AND status = ");
    qb.push_bind(status);

    let rows = qb.build_query_as::<ImageRow>().fetch_all(&self.db).await?;

    Ok(rows)
  }

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
    cursor: Option<CreatedAtCursor>,
    limit: i64,
    is_deleted: bool,
    is_favorite: Option<bool>,
  ) -> Result<Vec<ImageItemRow>, DatabaseError> {
    let mut qb = QueryBuilder::new(
      "
        SELECT
          id, file_name, path, size_bytes, width,
          height, thumbnail_path, created_at, is_favorite
        FROM images
        WHERE status != 3 AND is_deleted = ",
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

  pub async fn get_untagged_images_paginated(
    &self,
    cursor: Option<CreatedAtCursor>,
    limit: i64,
  ) -> Result<Vec<ImageItemRow>, DatabaseError> {
    let mut qb = QueryBuilder::new(
      r#"
        SELECT
          id, file_name, path, size_bytes, width,
          height, thumbnail_path, created_at, is_favorite
        FROM images
        WHERE NOT EXISTS (
          SELECT 1 FROM image_tags WHERE image_tags.image_id = images.id
        )
    "#,
    );

    qb.push(" AND is_deleted = 0");

    if let Some(cursor) = cursor {
      qb.push(" AND (images.created_at, images.id) < (");
      qb.push_bind(cursor.created_at);
      qb.push(", ");
      qb.push_bind(cursor.id);
      qb.push(")");
    }

    qb.push(" ORDER BY images.created_at DESC, images.id DESC LIMIT ");
    qb.push_bind(limit);

    let result = qb
      .build_query_as::<ImageItemRow>()
      .fetch_all(&self.db)
      .await?;

    Ok(result)
  }

  pub async fn get_images_by_tag_paginated(
    &self,
    cursor: Option<CreatedAtCursor>,
    limit: i64,
    tag_id: i64,
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

#[cfg(test)]
mod tests {
  use crate::infrastructure::utils::format_datetime;

  use super::*;
  use chrono::Utc;
  use sqlx::SqlitePool;

  #[sqlx::test(migrations = "./migrations")]
  async fn test_create_images(pool: SqlitePool) {
    let repo = ImageRepository::new(pool);
    let now = Utc::now().naive_utc();

    let files = vec![
      FileMetaData {
        path: "path/A.jpg".into(),
        file_name: "A.jpg".into(),
        size_bytes: 100,
        created_at: format_datetime(now),
      },
      FileMetaData {
        path: "path/B.jpg".into(),
        file_name: "B.jpg".into(),
        size_bytes: 200,
        created_at: format_datetime(now),
      },
      // Duplicate path to test "OR IGNORE"
      FileMetaData {
        path: "path/A.jpg".into(),
        file_name: "A.jpg".into(),
        size_bytes: 100,
        created_at: format_datetime(now),
      },
    ];

    let inserted = repo.create_images_by_file_metadata(&files).await.unwrap();

    // Result should be 2 because the 3rd item is a duplicate path
    assert_eq!(inserted, 2);
  }

  #[sqlx::test(migrations = "./migrations")]
  async fn test_image_updates_and_toggles(pool: SqlitePool) {
    let repo = ImageRepository::new(pool.clone());

    // Setup: Create an initial image
    sqlx::query("INSERT INTO images (path, file_name, size_bytes, created_at) VALUES ('test.jpg', 'test.jpg', 500, datetime('now'))")
          .execute(&pool).await.unwrap();

    let img_id: i64 = sqlx::query_scalar("SELECT id FROM images LIMIT 1")
      .fetch_one(&pool)
      .await
      .unwrap();

    // 1. Test toggle_image_favorite
    let first_toggle = repo.toggle_image_favorite(img_id).await.unwrap();
    assert!(first_toggle, "Should be true after first toggle");

    let second_toggle = repo.toggle_image_favorite(img_id).await.unwrap();
    assert!(!second_toggle, "Should be false after second toggle");

    // 2. Test update_image_deleted_status
    repo
      .update_image_deleted_status(vec![img_id], true)
      .await
      .unwrap();
    let is_deleted: bool = sqlx::query_scalar("SELECT is_deleted FROM images WHERE id = ?")
      .bind(img_id)
      .fetch_one(&pool)
      .await
      .unwrap();
    assert!(is_deleted);

    // 3. Test update_image_metadata (Passing a dummy Image struct)
    let update_payload = vec![Image {
      id: img_id,
      width: 1920,
      height: 1080,
      thumbnail_path: "thumb.jpg".into(),
      status: ImageStatus::Thumbnailed,
      retry_count: 0,
      error_message: None,
      ..Default::default()
    }];

    let affected = repo.update_image_metadata(&update_payload).await.unwrap();
    assert_eq!(affected, 1);
  }

  #[sqlx::test(migrations = "./migrations")]
  async fn test_pagination_flow(pool: SqlitePool) {
    let repo = ImageRepository::new(pool);
    let now = Utc::now().naive_utc();

    // Insert 3 images with distinct timestamps
    for i in 1..=3 {
      sqlx::query("INSERT INTO images (path, file_name, size_bytes, created_at, is_deleted) VALUES (?, ?, ?, ?, 0)")
              .bind(format!("p{}.jpg", i))
              .bind(format!("{}.jpg", i))
              .bind(i * 100)
              .bind(now + chrono::Duration::seconds(i))
              .execute(&repo.db).await.unwrap();
    }

    // Page 1: Limit 2 (Should return images 3 and 2)
    let page1 = repo
      .get_images_paginated(None, 2, false, None)
      .await
      .unwrap();
    assert_eq!(page1.len(), 2);
    assert_eq!(page1[0].file_name, "3.jpg");

    // Page 2: Using cursor from the last item of Page 1
    let cursor = CreatedAtCursor {
      created_at: format_datetime(page1[1].created_at),
      id: page1[1].id,
    };
    let page2 = repo
      .get_images_paginated(Some(cursor), 2, false, None)
      .await
      .unwrap();

    assert_eq!(page2.len(), 1);
    assert_eq!(page2[0].file_name, "1.jpg");
  }

  #[sqlx::test(migrations = "./migrations")]
  async fn test_get_by_tag_paginated(pool: SqlitePool) {
    let repo = ImageRepository::new(pool.clone());

    // 1. Create Image
    sqlx::query("INSERT INTO images (id, path, file_name, size_bytes, created_at, is_deleted) VALUES (10, 'tag_test.jpg', 'tag.jpg', 100, datetime('now'), 0)")
          .execute(&pool).await.unwrap();

    // 2. Create Tag and Link (Assuming your migration has an image_tags table)
    sqlx::query("INSERT INTO tags (text) VALUES ('Nature')")
      .execute(&pool)
      .await
      .unwrap();
    sqlx::query("INSERT INTO image_tags (image_id, tag_id) VALUES (10, 1)")
      .execute(&pool)
      .await
      .unwrap();

    // 3. Query by Tag
    let results = repo.get_images_by_tag_paginated(None, 10, 1).await.unwrap();

    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, 10);
  }
}
