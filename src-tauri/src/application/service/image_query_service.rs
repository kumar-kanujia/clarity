use crate::{
  application::error::AppError,
  infrastructure::{
    fs::ops, models::image_model::ImageItemRow, repo::image_repo::ImageRepository,
    utils::format_datetime,
  },
  interface::dtos::image_dto::{CreatedAtCursor, ImageItem, ImageItemResult},
};

#[derive(Debug)]
pub struct ImageQueryService {
  repo: ImageRepository,
}

impl ImageQueryService {
  pub fn new(repo: ImageRepository) -> Self {
    Self { repo }
  }

  fn split_for_pagination(
    &self,
    mut images: Vec<ImageItemRow>,
    limit: i64,
  ) -> (Option<CreatedAtCursor>, Vec<ImageItemRow>) {
    if images.len() > limit as usize {
      let next_item = images.pop().unwrap();
      let cursor = Some(CreatedAtCursor {
        created_at: format_datetime(next_item.created_at),
        id: next_item.id,
      });
      (cursor, images)
    } else {
      (None, images)
    }
  }

  async fn filter_and_process_images(
    &self,
    images: Vec<ImageItemRow>,
  ) -> Result<Vec<ImageItem>, AppError> {
    tokio::task::spawn_blocking(move || {
      images
        .into_iter()
        .filter_map(|raw| {
          if let Err(err) = ops::is_file_readable(&raw.path) {
            tracing::warn!(
                path = %raw.path,
                error = ?err,
                "Skipping unreadable image"
            );
            return None;
          }
          Some(ImageItem::from(raw))
        })
        .collect()
    })
    .await
    .map_err(|e| AppError::Join { source: e })
  }

  async fn paginate_and_process(
    &self,
    raw_images: Vec<ImageItemRow>,
    limit: i64,
  ) -> Result<ImageItemResult, AppError> {
    let (next_cursor, images_to_process) = self.split_for_pagination(raw_images, limit);
    let data = self.filter_and_process_images(images_to_process).await?;
    Ok(ImageItemResult { data, next_cursor })
  }

  pub async fn list_image_items(
    &self,
    limit: i64,
    cursor: Option<CreatedAtCursor>,
    is_deleted: bool,
    is_favorite: Option<bool>,
  ) -> Result<ImageItemResult, AppError> {
    let raw = self
      .repo
      .get_images_paginated(cursor, limit + 1, is_deleted, is_favorite)
      .await?;
    self.paginate_and_process(raw, limit).await
  }

  pub async fn list_untagged_image_items(
    &self,
    limit: i64,
    cursor: Option<CreatedAtCursor>,
  ) -> Result<ImageItemResult, AppError> {
    let raw = self
      .repo
      .get_untagged_images_paginated(cursor, limit + 1)
      .await?;
    self.paginate_and_process(raw, limit).await
  }

  pub async fn list_tagged_image_items(
    &self,
    tag_id: i64,
    limit: i64,
    cursor: Option<CreatedAtCursor>,
  ) -> Result<ImageItemResult, AppError> {
    let raw = self
      .repo
      .get_images_by_tag_paginated(cursor, limit + 1, tag_id)
      .await?;
    self.paginate_and_process(raw, limit).await
  }
}

#[cfg(test)]
mod tests {

  use crate::tests::utils::setup_test_db;

  use super::*;
  use chrono::{Duration, Utc};
  use tempfile::NamedTempFile;

  /// Helper to create a service and a clean DB
  async fn setup() -> (ImageQueryService, sqlx::SqlitePool) {
    let pool = setup_test_db().await;
    let repo = ImageRepository::new(pool.clone());
    (ImageQueryService::new(repo), pool)
  }

  #[tokio::test]
  async fn test_list_image_items_pagination_and_filtering() {
    let (service, pool) = setup().await;
    let now = Utc::now().naive_utc();

    // 1. Create 3 temporary files on disk
    let file1 = NamedTempFile::new().unwrap();
    let _file2 = NamedTempFile::new().unwrap();
    let file3 = NamedTempFile::new().unwrap();

    // 2. Seed Database
    // Note: Item 2 will be a "Ghost" (DB record exists, but file will be deleted)
    let entries = vec![
      (1, file1.path().to_str().unwrap(), "img1.jpg", now),
      (
        2,
        "non_existent.jpg",
        "img2.jpg",
        now - Duration::seconds(10),
      ),
      (
        3,
        file3.path().to_str().unwrap(),
        "img3.jpg",
        now - Duration::seconds(20),
      ),
    ];

    for (id, path, name, created) in entries {
      sqlx::query("INSERT INTO images (id, path, file_name, size_bytes, created_at) VALUES (?, ?, ?, 1024, ?)")
                  .bind(id).bind(path).bind(name).bind(created)
                  .execute(&pool).await.unwrap();
    }

    // 3. Execution: Limit of 1
    // Service fetches limit + 1 (2 items: img1 and img2)
    let result = service
      .list_image_items(1, None, false, None)
      .await
      .unwrap();

    // 4. Assertions
    // Item 1 is readable. Item 2 is missing, so filter_and_process_image should skip it.
    assert_eq!(
      result.data.len(),
      1,
      "Only img1.jpg should remain after filtering"
    );
    assert_eq!(result.data[0].id, 1);

    // Even though we filtered, did the pagination logic correctly identify a next page?
    // Since we fetched 2 from DB and the limit was 1, next_cursor should exist.
    assert!(
      result.next_cursor.is_some(),
      "Cursor should be generated from the fetched but skipped/popped item"
    );
  }

  #[tokio::test]
  async fn test_list_tagged_items_integration() {
    let (service, pool) = setup().await;

    // 1. Setup Image, Tag, and Association
    let img_file = NamedTempFile::new().unwrap();
    let img_path = img_file.path().to_str().unwrap();

    sqlx::query(
      "INSERT INTO images (id, path, file_name, size_bytes) VALUES (10, ?, 't.jpg', 500)",
    )
    .bind(img_path)
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query(
      "INSERT INTO tags (id, text, color, tag_type) VALUES (1, 'Nature', '#00FF00', 'user')",
    )
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query("INSERT INTO image_tags (image_id, tag_id) VALUES (10, 1)")
      .execute(&pool)
      .await
      .unwrap();

    // 2. Query by Tag
    let result = service.list_tagged_image_items(1, 10, None).await.unwrap();

    // 3. Assert
    assert_eq!(result.data.len(), 1);
    assert_eq!(result.data[0].id, 10);
  }

  #[tokio::test]
  async fn test_empty_results_handling() {
    let (service, _) = setup().await;

    let result = service
      .list_image_items(10, None, false, None)
      .await
      .unwrap();

    assert!(result.data.is_empty());
    assert!(result.next_cursor.is_none());
  }
}
