use tauri::State;

use crate::{
  application::service::image_tag_service::ImageTagService,
  infrastructure::repo::image_tag_repo::ImageTagRepository,
  interface::{dtos::tag_dto::TagItem, error::CommandError},
  setup::state::AppState,
};

fn make_tag_service(state: &State<'_, AppState>) -> ImageTagService {
  ImageTagService::new(ImageTagRepository::new(state.db.clone()))
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(image_id, tag_id))]
pub async fn toggle_tag(
  state: State<'_, AppState>,
  image_id: i64,
  tag_id: i64,
) -> Result<bool, CommandError> {
  let is_attached = make_tag_service(&state)
    .toggle_tag_on_image(image_id, tag_id)
    .await?;
  tracing::info!(image_id, tag_id, is_attached, "Tag toggled on image");
  Ok(is_attached)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(image_id, limit))]
pub async fn attached_tags(
  state: State<'_, AppState>,
  image_id: i64,
  limit: Option<i64>,
) -> Result<Vec<TagItem>, CommandError> {
  let tags = make_tag_service(&state)
    .list_attached_tags_on_image(image_id, limit)
    .await?;
  tracing::info!(image_id, count = tags.len(), "Attached tags fetched");
  Ok(tags)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(image_id, limit))]
pub async fn available_tags(
  state: State<'_, AppState>,
  image_id: i64,
  limit: Option<i64>,
) -> Result<Vec<TagItem>, CommandError> {
  let tags = make_tag_service(&state)
    .list_available_tags_on_image(image_id, limit)
    .await?;
  tracing::info!(image_id, count = tags.len(), "Available tags fetched");
  Ok(tags)
}

#[tauri::command]
#[tracing::instrument(skip(state, image_ids), fields(image_count = image_ids.len(), limit))]
pub async fn attached_tags_multiple(
  state: State<'_, AppState>,
  image_ids: Vec<i64>,
  limit: Option<i64>,
) -> Result<Vec<TagItem>, CommandError> {
  let tags = make_tag_service(&state)
    .list_attached_tags_on_images(image_ids, limit)
    .await?;
  tracing::info!(
    count = tags.len(),
    "Attached tags fetched for multiple images"
  );
  Ok(tags)
}

#[tauri::command]
#[tracing::instrument(skip(state, image_ids), fields(image_count = image_ids.len(), limit))]
pub async fn available_tags_multiple(
  state: State<'_, AppState>,
  image_ids: Vec<i64>,
  limit: Option<i64>,
) -> Result<Vec<TagItem>, CommandError> {
  let tags = make_tag_service(&state)
    .list_available_tags_on_images(image_ids, limit)
    .await?;
  tracing::info!(
    count = tags.len(),
    "Available tags fetched for multiple images"
  );
  Ok(tags)
}

#[tauri::command]
#[tracing::instrument(skip(state, image_ids), fields(image_count = image_ids.len(), tag_id))]
pub async fn attach_tag(
  state: State<'_, AppState>,
  image_ids: Vec<i64>,
  tag_id: i64,
) -> Result<u64, CommandError> {
  let count = make_tag_service(&state)
    .attach_tag_to_images(image_ids, tag_id)
    .await?;
  tracing::info!(tag_id, count, "Tag attached to images");
  Ok(count)
}

#[tauri::command]
#[tracing::instrument(skip(state, image_ids), fields(image_count = image_ids.len(), tag_id))]
pub async fn remove_tag(
  state: State<'_, AppState>,
  image_ids: Vec<i64>,
  tag_id: i64,
) -> Result<u64, CommandError> {
  let count = make_tag_service(&state)
    .remove_tag_from_images(image_ids, tag_id)
    .await?;
  tracing::info!(tag_id, count, "Tag removed from images");
  Ok(count)
}
