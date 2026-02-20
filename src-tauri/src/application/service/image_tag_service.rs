use crate::{
  application::error::AppError,
  infrastructure::{models::tag_model::TagType, repo::image_tag_repo::ImageTagRepository},
  interface::dtos::tag_dto::TagItem,
};

pub struct ImageTagService {
  repo: ImageTagRepository,
}

impl ImageTagService {
  pub fn new(repo: ImageTagRepository) -> Self {
    Self { repo }
  }

  pub async fn toggle_tag_on_image(&self, image_id: i64, tag_id: i64) -> Result<bool, AppError> {
    let res = self
      .repo
      .create_or_delete_image_tag(image_id, tag_id)
      .await?;
    Ok(res)
  }

  pub async fn list_attached_tags_on_image(
    &self,
    image_id: i64,
    limit: Option<i64>,
  ) -> Result<Vec<TagItem>, AppError> {
    let raw = self
      .repo
      .get_tags_attached_to_image(image_id, TagType::User, limit)
      .await?;
    let res = raw.into_iter().map(|r| TagItem::from(r)).collect();
    Ok(res)
  }

  pub async fn list_available_tags_on_image(
    &self,
    image_id: i64,
    limit: Option<i64>,
  ) -> Result<Vec<TagItem>, AppError> {
    let raw = self
      .repo
      .get_tags_not_attached_to_image(image_id, TagType::User, limit)
      .await?;
    let res = raw.into_iter().map(|r| TagItem::from(r)).collect();
    Ok(res)
  }
}
