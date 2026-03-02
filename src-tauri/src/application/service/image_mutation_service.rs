use crate::{
  application::error::AppError,
  domain::file::FileMetaData,
  infrastructure::{models::image_model::ImageStatus, repo::image_repo::ImageRepository},
};

pub struct ImageMutationService {
  repo: ImageRepository,
}

impl ImageMutationService {
  pub fn new(repo: ImageRepository) -> Self {
    Self { repo }
  }

  pub async fn persist_file_metadata_for_images(
    &self,
    image_metadata: &[FileMetaData],
  ) -> Result<u64, AppError> {
    let imported = self
      .repo
      .create_images_by_file_metadata(image_metadata)
      .await?;

    Ok(imported)
  }

  #[tracing::instrument(skip(self))]
  pub async fn change_image_is_favorite(&self, image_id: i64) -> Result<bool, AppError> {
    let is_favorite = self.repo.toggle_image_favorite(image_id).await?;
    Ok(is_favorite)
  }

  #[tracing::instrument(skip(self, image_ids))]
  pub async fn change_image_is_deleted(
    &self,
    image_ids: Vec<i64>,
    is_deleted: bool,
  ) -> Result<u64, AppError> {
    let changed = self
      .repo
      .update_image_deleted_status(&image_ids, is_deleted)
      .await?;
    Ok(changed)
  }

  #[tracing::instrument(skip(self))]
  pub async fn hard_delete_all_images(&self) -> Result<u64, AppError> {
    let rows_affected = self.repo.update_image_status_deleted_all().await?;
    Ok(rows_affected)
  }

  #[tracing::instrument(skip(self, image_ids))]
  pub async fn hard_delete_images(&self, image_ids: &[i64]) -> Result<u64, AppError> {
    if image_ids.is_empty() {
      return Ok(0);
    }
    let rows_affected = self
      .repo
      .update_image_status(image_ids, ImageStatus::Deleted)
      .await?;
    Ok(rows_affected)
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::{infrastructure::utils::format_datetime, tests::utils::setup_test_db};
  use chrono::Utc;

  async fn setup_service() -> (ImageMutationService, sqlx::SqlitePool) {
    let pool = setup_test_db().await;
    let repo = ImageRepository::new(pool.clone());
    let service = ImageMutationService::new(repo);
    (service, pool)
  }

  #[tokio::test]
  async fn test_persist_metadata() {
    let (service, _) = setup_service().await;
    let now = Utc::now().naive_utc();

    let metadata = vec![
      FileMetaData {
        path: "service_test_1.jpg".into(),
        file_name: "1.jpg".into(),
        size_bytes: 500,
        created_at: format_datetime(now),
      },
      FileMetaData {
        path: "service_test_2.jpg".into(),
        file_name: "2.jpg".into(),
        size_bytes: 1000,
        created_at: format_datetime(now),
      },
    ];

    let result = service
      .persist_file_metadata_for_images(&metadata)
      .await
      .unwrap();

    // Verifies the service correctly returns the count as i64
    assert_eq!(result, 2);
  }

  #[tokio::test]
  async fn test_change_favorite_flow() {
    let (service, pool) = setup_service().await;

    // 1. Manually insert an image to test against
    sqlx::query(
      "INSERT INTO images (id, path, file_name, size_bytes) VALUES (100, 'fav.jpg', 'fav.jpg', 1)",
    )
    .execute(&pool)
    .await
    .unwrap();

    // 2. Toggle via service
    let is_fav = service.change_image_is_favorite(100).await.unwrap();
    assert!(is_fav);

    // 3. Verify in DB
    let db_fav: bool = sqlx::query_scalar("SELECT is_favorite FROM images WHERE id = 100")
      .fetch_one(&pool)
      .await
      .unwrap();
    assert!(db_fav);
  }

  #[tokio::test]
  async fn test_change_deleted_status() {
    let (service, pool) = setup_service().await;

    sqlx::query(
      "INSERT INTO images (id, path, file_name, size_bytes) VALUES (200, 'del.jpg', 'del.jpg', 1)",
    )
    .execute(&pool)
    .await
    .unwrap();

    // Mark as deleted
    service
      .change_image_is_deleted(vec![200], true)
      .await
      .unwrap();

    let is_del: bool = sqlx::query_scalar("SELECT is_deleted FROM images WHERE id = 200")
      .fetch_one(&pool)
      .await
      .unwrap();
    assert!(is_del);
  }

  #[tokio::test]
  async fn test_service_error_mapping() {
    let (service, _) = setup_service().await;

    // Try to delete an image that doesn't exist
    let result = service.change_image_is_deleted(vec![999], true).await;

    // This verifies that the Repository's DatabaseError::NotFound
    // is correctly converted into an AppError (assuming your ? handles this)
    assert!(result.is_err());
  }
}
