use tauri::State;

use crate::{
  application::service::image_tag_service::ImageTagService,
  infrastructure::repo::image_tag_repo::ImageTagRepository,
  interface::{dtos::tag_dto::TagItem, error::CommandError},
  state::AppState,
};

#[tauri::command]
#[tracing::instrument(skip(state), fields(image_id = image_id, tag_id = tag_id))]
pub async fn toggle_tag(
  state: State<'_, AppState>,
  image_id: i64,
  tag_id: i64,
) -> Result<bool, CommandError> {
  let image_tag_repository = ImageTagRepository::new(state.db.clone());

  let image_tag_service = ImageTagService::new(image_tag_repository);

  let is_attached = image_tag_service
    .toggle_tag_on_image(image_id, tag_id)
    .await?;

  tracing::info!(
    is_attached = is_attached,
    "Tag toggle on image {} completed:",
    image_id
  );

  Ok(is_attached)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(image_id = image_id, limit = limit))]
pub async fn fetch_attached_tags(
  state: State<'_, AppState>,
  image_id: i64,
  limit: Option<i64>,
) -> Result<Vec<TagItem>, CommandError> {
  let image_tag_repository = ImageTagRepository::new(state.db.clone());

  let image_tag_service = ImageTagService::new(image_tag_repository);

  let tags = image_tag_service
    .list_attached_tags_on_image(image_id, limit)
    .await?;

  tracing::info!(
    tags_len = tags.len(),
    "Fetch tags for image {} completed:",
    image_id
  );

  Ok(tags)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(image_id = image_id, limit = limit))]
pub async fn fetch_available_tags(
  state: State<'_, AppState>,
  image_id: i64,
  limit: Option<i64>,
) -> Result<Vec<TagItem>, CommandError> {
  let image_tag_repository = ImageTagRepository::new(state.db.clone());

  let image_tag_service = ImageTagService::new(image_tag_repository);

  let tags = image_tag_service
    .list_available_tags_on_image(image_id, limit)
    .await?;

  tracing::info!(tags_len = tags.len(), "Fetch available tags comlete");

  Ok(tags)
}
