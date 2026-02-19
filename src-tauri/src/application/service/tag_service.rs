use crate::{
  domain::tag::Tag,
  error::AppError,
  infrastructure::{models::tag_model::TagType, repo::tag_repo::TagRepository},
  interface::dtos::tag_dto::TagItem,
  setup::settings::TAG_FETCH_LIMIT,
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
    tag_text: &str,
    tag_color: &str,
  ) -> Result<i64, AppError> {
    let tag_text = Tag::normalize_text(tag_text);
    let tag_color = Tag::normalize_color(tag_color);
    let new_tag_id = self
      .repo
      .create_new_tag(&tag_text, &tag_color, TagType::User)
      .await?;
    Ok(new_tag_id)
  }

  pub async fn soft_delete_user_tag(&self, tag_id: i64) -> Result<(), AppError> {
    self
      .repo
      .update_tag_tag_type(tag_id, TagType::Deleted)
      .await?;
    Ok(())
  }

  pub async fn list_top_user_tags(&self) -> Result<Vec<TagItem>, AppError> {
    let tag_rows = self
      .repo
      .get_tags_order_by_image_count(TagType::User, Some(TAG_FETCH_LIMIT))
      .await?;
    Ok(tag_rows.into_iter().map(TagItem::from).collect())
  }

  pub async fn list_all_user_tags(&self) -> Result<Vec<TagItem>, AppError> {
    let tag_rows = self
      .repo
      .get_tags_order_by_image_count(TagType::User, None)
      .await?;
    Ok(tag_rows.into_iter().map(TagItem::from).collect())
  }
}
