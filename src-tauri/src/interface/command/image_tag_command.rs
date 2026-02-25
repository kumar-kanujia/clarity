use crate::{
  application::service::image_tag_service::ImageTagService,
  infrastructure::repo::image_tag_repo::ImageTagRepository,
  interface::{dtos::tag_dto::TagItem, error::CommandError},
  setup::state::AppState,
};

use tauri::State;

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

  tracing::info!(is_attached = is_attached, "Tag toggle on image completed");

  Ok(is_attached)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(count = image_ids.len(), tag_id = tag_id))]
pub async fn attach_tag(
  state: State<'_, AppState>,
  image_ids: Vec<i64>,
  tag_id: i64,
) -> Result<u64, CommandError> {
  let image_tag_repository = ImageTagRepository::new(state.db.clone());

  let image_tag_service = ImageTagService::new(image_tag_repository);

  let attached_tags = image_tag_service
    .attach_tag_to_images(image_ids, tag_id)
    .await?;

  tracing::info!(
    tag_id = tag_id,
    count = attached_tags,
    "Tag attachment on images completed"
  );

  Ok(attached_tags)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(count = image_ids.len(), tag_id = tag_id))]
pub async fn remove_tag(
  state: State<'_, AppState>,
  image_ids: Vec<i64>,
  tag_id: i64,
) -> Result<u64, CommandError> {
  let image_tag_repository = ImageTagRepository::new(state.db.clone());

  let image_tag_service = ImageTagService::new(image_tag_repository);

  let removed_count = image_tag_service
    .remove_tag_from_images(image_ids, tag_id)
    .await?;

  tracing::info!(
    tag_id = tag_id,
    count = removed_count,
    "Tag removal from images complete"
  );

  Ok(removed_count)
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

  tracing::info!(tags_len = tags.len(), "Fetch attached tags completed");

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

  tracing::info!(tags_len = tags.len(), "Fetch available tags completed");

  Ok(tags)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(count = image_ids.len(), limit = limit))]
pub async fn attached_tags(
  state: State<'_, AppState>,
  image_ids: Vec<i64>,
  limit: Option<i64>,
) -> Result<Vec<TagItem>, CommandError> {
  let image_tag_repository = ImageTagRepository::new(state.db.clone());

  let image_tag_service = ImageTagService::new(image_tag_repository);

  let tags = image_tag_service
    .list_attached_tags_on_images(image_ids, limit)
    .await?;

  tracing::info!(tags_len = tags.len(), "Attched tags sent");

  Ok(tags)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(count = image_ids.len(), limit = limit))]
pub async fn available_tags(
  state: State<'_, AppState>,
  image_ids: Vec<i64>,
  limit: Option<i64>,
) -> Result<Vec<TagItem>, CommandError> {
  let image_tag_repository = ImageTagRepository::new(state.db.clone());

  let image_tag_service = ImageTagService::new(image_tag_repository);

  let tags = image_tag_service
    .list_available_tags_on_images(image_ids, limit)
    .await?;

  tracing::info!(tags_len = tags.len(), "Available tags sent");

  Ok(tags)
}
