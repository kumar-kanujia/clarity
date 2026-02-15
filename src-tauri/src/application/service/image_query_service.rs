use crate::{
  domain::image::Image,
  error::AppError,
  infrastructure::{
    fs::ops, models::image_model::ImageRow, repo::image_repo::ImageRepository,
    system::format_datetime,
  },
  interface::dto::{ImageCursor, ImageDto, PaginatedImages},
  setup::state::Db,
};

#[derive(Debug)]
pub struct ImageQueryService {
  repo: ImageRepository,
}

impl ImageQueryService {
  pub fn new(db: Db) -> Self {
    Self {
      repo: ImageRepository::new(db),
    }
  }

  #[tracing::instrument(skip(self))]
  pub async fn list_images_with_tag_paginated(
    &self,
    tag_id: i64,
    limit: i64,
    cursor: Option<ImageCursor>,
  ) -> Result<PaginatedImages, AppError> {
    let raw_images = self
      .repo
      .list_images_with_tag_id_paginated(tag_id, limit + 1, cursor)
      .await?;

    let (next_cursor, images_to_process) = self.split_for_pagination(raw_images, limit);

    let data = self.filter_image(images_to_process);

    Ok(PaginatedImages { data, next_cursor })
  }

  #[tracing::instrument(skip(self))]
  pub async fn list_images_paginated(
    &self,
    limit: i64,
    cursor: Option<ImageCursor>,
  ) -> Result<PaginatedImages, AppError> {
    let raw_images = self.repo.list_images_paginated(limit + 1, cursor).await?;

    let (next_cursor, images_to_process) = self.split_for_pagination(raw_images, limit);

    let data = self.filter_image(images_to_process);

    Ok(PaginatedImages { data, next_cursor })
  }

  fn filter_image(&self, images: Vec<ImageRow>) -> Vec<ImageDto> {
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
        Some(ImageDto::from(Image::from(raw)))
      })
      .collect()
  }

  fn split_for_pagination(
    &self,
    mut images: Vec<ImageRow>,
    limit: i64,
  ) -> (Option<ImageCursor>, Vec<ImageRow>) {
    if images.len() > limit as usize {
      let next_item = images.pop().unwrap(); // Remove the 11th item
      let cursor = Some(ImageCursor {
        created_at: format_datetime(next_item.created_at),
        id: next_item.id,
      });
      (cursor, images)
    } else {
      (None, images)
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::infrastructure::models::image_model::ImageStatus;
  use chrono::NaiveDateTime;

  fn create_test_image_row(id: i64, created_at: &str) -> ImageRow {
    ImageRow {
      id,
      path: format!("/test/{}.jpg", id),
      size_bytes: 1000,
      content_hash: None,
      width: None,
      height: None,
      thumbnail_path: None,
      status: ImageStatus::Pending,
      retry_count: 0,
      error_message: None,
      created_at: NaiveDateTime::parse_from_str(created_at, "%Y-%m-%d %H:%M:%S").unwrap(),
      updated_at: NaiveDateTime::parse_from_str(created_at, "%Y-%m-%d %H:%M:%S").unwrap(),
    }
  }

  #[tokio::test]
  async fn test_split_for_pagination_empty_list() {
    let db = sqlx::SqlitePool::connect(":memory:").await.unwrap();
    let service = ImageQueryService::new(db);

    let images = vec![];
    let (cursor, result) = service.split_for_pagination(images, 10);

    assert!(cursor.is_none());
    assert_eq!(result.len(), 0);
  }

  #[tokio::test]
  async fn test_split_for_pagination_less_than_limit() {
    let db = sqlx::SqlitePool::connect(":memory:").await.unwrap();
    let service = ImageQueryService::new(db);

    let images = vec![
      create_test_image_row(1, "2024-01-01 10:00:00"),
      create_test_image_row(2, "2024-01-02 10:00:00"),
      create_test_image_row(3, "2024-01-03 10:00:00"),
    ];

    let (cursor, result) = service.split_for_pagination(images, 10);

    assert!(cursor.is_none());
    assert_eq!(result.len(), 3);
  }

  #[tokio::test]
  async fn test_split_for_pagination_equal_to_limit() {
    let db = sqlx::SqlitePool::connect(":memory:").await.unwrap();
    let service = ImageQueryService::new(db);

    let images = vec![
      create_test_image_row(1, "2024-01-01 10:00:00"),
      create_test_image_row(2, "2024-01-02 10:00:00"),
      create_test_image_row(3, "2024-01-03 10:00:00"),
    ];

    let (cursor, result) = service.split_for_pagination(images, 3);

    assert!(cursor.is_none());
    assert_eq!(result.len(), 3);
  }

  #[tokio::test]
  async fn test_split_for_pagination_more_than_limit() {
    let db = sqlx::SqlitePool::connect(":memory:").await.unwrap();
    let service = ImageQueryService::new(db);

    let images = vec![
      create_test_image_row(1, "2024-01-01 10:00:00"),
      create_test_image_row(2, "2024-01-02 10:00:00"),
      create_test_image_row(3, "2024-01-03 10:00:00"),
      create_test_image_row(4, "2024-01-04 10:00:00"),
    ];

    let (cursor, result) = service.split_for_pagination(images, 3);

    assert!(cursor.is_some());
    let cursor = cursor.unwrap();
    assert_eq!(cursor.id, 4);
    assert_eq!(cursor.created_at, "2024-01-04 10:00:00");
    assert_eq!(result.len(), 3);
    assert_eq!(result[0].id, 1);
    assert_eq!(result[1].id, 2);
    assert_eq!(result[2].id, 3);
  }

  #[tokio::test]
  async fn test_split_for_pagination_exactly_one_over_limit() {
    let db = sqlx::SqlitePool::connect(":memory:").await.unwrap();
    let service = ImageQueryService::new(db);

    let images = vec![
      create_test_image_row(1, "2024-01-01 10:00:00"),
      create_test_image_row(2, "2024-01-02 10:00:00"),
    ];

    let (cursor, result) = service.split_for_pagination(images, 1);

    assert!(cursor.is_some());
    let cursor = cursor.unwrap();
    assert_eq!(cursor.id, 2);
    assert_eq!(result.len(), 1);
    assert_eq!(result[0].id, 1);
  }

  #[tokio::test]
  async fn test_split_for_pagination_large_dataset() {
    let db = sqlx::SqlitePool::connect(":memory:").await.unwrap();
    let service = ImageQueryService::new(db);

    let mut images = vec![];
    for i in 1..=101 {
      images.push(create_test_image_row(i, "2024-01-01 10:00:00"));
    }

    let (cursor, result) = service.split_for_pagination(images, 100);

    assert!(cursor.is_some());
    let cursor = cursor.unwrap();
    assert_eq!(cursor.id, 101);
    assert_eq!(result.len(), 100);
    assert_eq!(result[0].id, 1);
    assert_eq!(result[99].id, 100);
  }
}