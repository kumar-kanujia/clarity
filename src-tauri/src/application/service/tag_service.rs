use crate::{
  domain::tag::Tag,
  error::AppError,
  infrastructure::{models::tag_model::TagType, repo::tag_repo::TagRepository},
  interface::dtos::tag_dto::TagDto,
  state::Db,
};

pub struct TagService {
  repo: TagRepository,
}

impl TagService {
  pub fn new(db: Db) -> Self {
    Self {
      repo: TagRepository::new(db),
    }
  }

  pub async fn create_new_tag(&self, tag_text: &str) -> Result<i64, AppError> {
    let tag_text = Tag::normalize_text(tag_text);
    let new_tag_id = self.repo.save_new_tag(&tag_text, TagType::User).await?;
    Ok(new_tag_id)
  }

  pub async fn get_user_tags(&self) -> Result<Vec<TagDto>, AppError> {
    let user_tags = self
      .repo
      .list_tags(TagType::User)
      .await?
      .into_iter()
      .map(TagDto::from)
      .collect();
    Ok(user_tags)
  }

  pub async fn get_system_tags(&self) -> Result<Vec<TagDto>, AppError> {
    let system_tags = self
      .repo
      .list_tags(TagType::System)
      .await?
      .into_iter()
      .map(TagDto::from)
      .collect();
    Ok(system_tags)
  }

  pub async fn delete_user_tag(&self, tag_id: i64) -> Result<(), AppError> {
    self.repo.delete_tag(tag_id, TagType::User).await?;
    Ok(())
  }
}
