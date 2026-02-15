use crate::{
  error::AppError,
  infrastructure::{models::tag_model::TagType, repo::tag_repo::TagRepository},
  interface::dto::TagDto,
  setup::state::Db,
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
    let tag_text = tag_text.to_ascii_lowercase();
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
    let user_tags = self
      .repo
      .list_tags(TagType::User)
      .await?
      .into_iter()
      .map(TagDto::from)
      .collect();
    Ok(user_tags)
  }
}
