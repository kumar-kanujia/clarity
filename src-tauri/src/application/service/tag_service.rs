use crate::{
  application::error::AppError,
  domain::tag::Tag,
  infrastructure::{
    models::tag_model::TagType,
    repo::{error::DatabaseError, tag_repo::TagRepository},
  },
  interface::dtos::tag_dto::TagItem,
};

pub struct TagService {
  repo: TagRepository,
}

impl TagService {
  pub fn new(repo: TagRepository) -> Self {
    Self { repo }
  }

  pub async fn create_new_user_tag(
    &self,
    tag_name: &str,
    tag_color: &str,
  ) -> Result<i64, AppError> {
    if tag_name.is_empty() {
      return Err(AppError::Validation("Tag name cannot be empty".to_string()));
    }
    let tag_name = Tag::normalize_text(tag_name);
    let tag_color = Tag::normalize_color(tag_color);

    self
      .repo
      .create_tag(&tag_name, &tag_color, TagType::User)
      .await
      .map_err(|err| match err {
        DatabaseError::RecordAlreadyExists => {
          AppError::Validation("Tag already exists".to_string())
        }
        _ => AppError::Database { source: err },
      })
  }

  pub async fn edit_user_tag(
    &self,
    tag_id: i64,
    tag_name: Option<String>,
    tag_color: Option<String>,
  ) -> Result<(), AppError> {
    if let Some(ref name) = tag_name {
      if name.is_empty() {
        return Err(AppError::Validation("Tag name cannot be empty".to_string()));
      }
    }
    let tag_name = tag_name.map(|t| Tag::normalize_text(&t));
    let tag_color = tag_color.map(|c| Tag::normalize_color(&c));
    self.repo.update_tag(tag_id, tag_name, tag_color).await?;
    Ok(())
  }

  pub async fn change_tag_type(&self, tag_id: i64, tag_type: TagType) -> Result<(), AppError> {
    self.repo.update_tag_type(tag_id, tag_type).await?;
    Ok(())
  }

  pub async fn delete_tag(&self, tag_id: i64) -> Result<(), AppError> {
    self.repo.delete_tag(tag_id).await?;
    Ok(())
  }

  pub async fn list_user_tags(&self, limit: Option<i64>) -> Result<Vec<TagItem>, AppError> {
    let tag_rows = self
      .repo
      .get_tags_by_image_count(TagType::User, limit)
      .await?;
    Ok(tag_rows.into_iter().map(TagItem::from).collect())
  }

  pub async fn list_user_inactive_tags(
    &self,
    limit: Option<i64>,
  ) -> Result<Vec<TagItem>, AppError> {
    let tag_rows = self
      .repo
      .get_tags_by_image_count(TagType::Inactive, limit)
      .await?;
    Ok(tag_rows.into_iter().map(TagItem::from).collect())
  }
}

#[cfg(test)]
mod tests {
  use crate::tests::utils::setup_test_db;

  use super::*;

  async fn setup() -> (TagService, sqlx::SqlitePool) {
    let pool = setup_test_db().await;
    let repo = TagRepository::new(pool.clone());
    (TagService::new(repo), pool)
  }

  #[tokio::test]
  async fn test_create_tag_normalization_and_validation() {
    let (service, _) = setup().await;

    // 1. Test Validation: Empty name should fail at the service level
    let err = service
      .create_new_user_tag("", "#FFFFFF")
      .await
      .unwrap_err();
    assert!(matches!(err, AppError::Validation(_)));

    // 2. Test Normalization: Service should clean up input
    // Assuming Tag::normalize_text trims and lowercase
    let tag_id = service
      .create_new_user_tag("  NATURE  ", "red")
      .await
      .unwrap();

    let tags = service.list_user_tags(None).await.unwrap();
    assert_eq!(tags[0].id, tag_id);
    assert_eq!(tags[0].tag_name, "nature"); // Verified normalized text
  }

  #[tokio::test]
  async fn test_duplicate_tag_error_mapping() {
    let (service, _) = setup().await;

    service
      .create_new_user_tag("unique", "#FFFFFF")
      .await
      .unwrap();

    // 2nd attempt with same name
    let result = service.create_new_user_tag("unique", "#111111").await;

    // Verifies DatabaseError::RecordAlreadyExists -> AppError::Validation
    match result {
      Err(AppError::Validation(msg)) => assert!(msg.contains("already exists")),
      _ => panic!(
        "Expected validation error for duplicate tag, got {:?}",
        result
      ),
    }
  }

  #[tokio::test]
  async fn test_soft_delete_flow() {
    let (service, _) = setup().await;

    let tag_id = service
      .create_new_user_tag("to_delete", "gray")
      .await
      .unwrap();

    // Perform "soft delete" (changing type to Deleted)
    service
      .change_tag_type(tag_id, TagType::Inactive)
      .await
      .unwrap();

    // list_user_tags only fetches TagType::User, so this should be empty now
    let tags = service.list_user_tags(None).await.unwrap();
    assert!(tags.is_empty());
  }
}
