use crate::{
  application::error::AppError,
  infrastructure::{models::tag_model::TagType, repo::image_tag_repo::ImageTagRepository},
  interface::dtos::tag_dto::TagItem,
};

fn into_tag_items(raw: Vec<impl Into<TagItem>>) -> Vec<TagItem> {
  raw.into_iter().map(Into::into).collect()
}

pub struct ImageTagService {
  repo: ImageTagRepository,
}

impl ImageTagService {
  pub fn new(repo: ImageTagRepository) -> Self {
    Self { repo }
  }

  pub async fn toggle_tag_on_image(&self, image_id: i64, tag_id: i64) -> Result<bool, AppError> {
    let res = self.repo.toggle_image_tag(image_id, tag_id).await?;
    Ok(res)
  }

  pub async fn attach_tag_to_images(
    &self,
    image_ids: Vec<i64>,
    tag_id: i64,
  ) -> Result<u64, AppError> {
    let res = self.repo.create_image_tags(&image_ids, tag_id).await?;
    Ok(res)
  }

  pub async fn remove_tag_from_images(
    &self,
    image_ids: Vec<i64>,
    tag_id: i64,
  ) -> Result<u64, AppError> {
    let res = self.repo.delete_image_tags(&image_ids, tag_id).await?;
    Ok(res)
  }

  pub async fn list_attached_tags_on_image(
    &self,
    image_id: i64,
    limit: Option<i64>,
  ) -> Result<Vec<TagItem>, AppError> {
    let res = self
      .repo
      .get_tags_attached_to_image(image_id, TagType::User, limit)
      .await
      .map(into_tag_items)?;
    Ok(res)
  }

  pub async fn list_available_tags_on_image(
    &self,
    image_id: i64,
    limit: Option<i64>,
  ) -> Result<Vec<TagItem>, AppError> {
    let res = self
      .repo
      .get_tags_not_attached_to_image(image_id, TagType::User, limit)
      .await
      .map(into_tag_items)?;
    Ok(res)
  }

  pub async fn list_attached_tags_on_images(
    &self,
    image_ids: Vec<i64>,
    limit: Option<i64>,
  ) -> Result<Vec<TagItem>, AppError> {
    let res = self
      .repo
      .get_tags_attached_to_images(&image_ids, TagType::User, limit)
      .await
      .map(into_tag_items)?;
    Ok(res)
  }

  pub async fn list_available_tags_on_images(
    &self,
    image_ids: Vec<i64>,
    limit: Option<i64>,
  ) -> Result<Vec<TagItem>, AppError> {
    let res = self
      .repo
      .get_tags_not_attached_to_images(&image_ids, TagType::User, limit)
      .await
      .map(into_tag_items)?;
    Ok(res)
  }
}

#[cfg(test)]
mod tests {
  use crate::tests::utils::setup_test_db;

  use super::*;

  async fn setup() -> (ImageTagService, sqlx::SqlitePool) {
    let pool = setup_test_db().await;
    let repo = ImageTagRepository::new(pool.clone());
    (ImageTagService::new(repo), pool)
  }

  #[tokio::test]
  async fn test_toggle_tag_cycle() {
    let (service, pool) = setup().await;

    // 1. Setup: Create 1 image and 1 tag
    sqlx::query(
      "INSERT INTO images (id, path, file_name, size_bytes) VALUES (1, 't.jpg', 't.jpg', 1)",
    )
    .execute(&pool)
    .await
    .unwrap();
    sqlx::query(
      "INSERT INTO tags (id, text, color, tag_type) VALUES (1, 'Nature', '#26A69A', 'user')",
    )
    .execute(&pool)
    .await
    .unwrap();

    // 2. Toggle ON
    let is_attached = service.toggle_tag_on_image(1, 1).await.unwrap();
    assert!(is_attached, "First toggle should attach");

    // 3. Toggle OFF
    let is_attached_now = service.toggle_tag_on_image(1, 1).await.unwrap();
    assert!(!is_attached_now, "Second toggle should detach");
  }

  #[tokio::test]
  async fn test_list_attached_and_available_logic() {
    let (service, pool) = setup().await;

    // 1. Setup: 1 Image, 2 User Tags
    sqlx::query(
      "INSERT INTO images (id, path, file_name, size_bytes) VALUES (1, 'test.jpg', 'test.jpg', 2)",
    )
    .execute(&pool)
    .await
    .unwrap();
    sqlx::query(
      "INSERT INTO tags (id, text, color, tag_type) VALUES (10, 'Tag A', '#26A69A', 'user')",
    )
    .execute(&pool)
    .await
    .unwrap();
    sqlx::query(
      "INSERT INTO tags (id, text, color, tag_type) VALUES (20, 'Tag B', '#123213', 'user')",
    )
    .execute(&pool)
    .await
    .unwrap();

    // 2. Attach Tag A (ID 10)
    service.toggle_tag_on_image(1, 10).await.unwrap();

    // 3. Verify Attached List
    let attached = service.list_attached_tags_on_image(1, None).await.unwrap();
    assert_eq!(attached.len(), 1);
    assert_eq!(attached[0].id, 10);

    // 4. Verify Available List (Should only show Tag B)
    let available = service.list_available_tags_on_image(1, None).await.unwrap();
    assert_eq!(available.len(), 1);
    assert_eq!(available[0].id, 20);
  }
}
