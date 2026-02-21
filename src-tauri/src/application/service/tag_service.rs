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
    let new_tag_id = self
      .repo
      .create_new_tag(&tag_name, &tag_color, TagType::User)
      .await
      .map_err(|err| match err {
        DatabaseError::RecordAlreadyExists => {
          AppError::Validation("Tag already exists".to_string())
        }
        _ => AppError::Database { source: err },
      })?;
    Ok(new_tag_id)
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

  pub async fn soft_delete_user_tag(&self, tag_id: i64) -> Result<(), AppError> {
    self.repo.update_tag_type(tag_id, TagType::Deleted).await?;
    Ok(())
  }

  pub async fn list_user_tags(&self, limit: Option<i64>) -> Result<Vec<TagItem>, AppError> {
    let tag_rows = self.repo.get_popular_tags(TagType::User, limit).await?;
    Ok(tag_rows.into_iter().map(TagItem::from).collect())
  }
}
