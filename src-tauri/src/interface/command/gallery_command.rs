use crate::{
  application::service::image_query_service::ImageQueryService,
  infrastructure::repo::image_repo::ImageRepository,
  interface::{
    dtos::image_dto::{CreatedAtCursor, ImageItemResult},
    error::CommandError,
  },
  setup::{settings::FETCH_LIMIT, state::AppState},
};

use tauri::State;

fn make_query_service(state: &AppState) -> ImageQueryService {
  ImageQueryService::new(ImageRepository::new(state.db.clone()))
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(cursor = ?cursor))]
pub async fn fetch_all_images(
  state: State<'_, AppState>,
  cursor: Option<CreatedAtCursor>,
) -> Result<ImageItemResult, CommandError> {
  let result = make_query_service(&state)
    .list_image_items(FETCH_LIMIT, cursor, false, None)
    .await?;
  tracing::info!(count = result.data.len(), "Fetched all image");
  Ok(result)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(cursor = ?cursor))]
pub async fn fetch_trash(
  state: State<'_, AppState>,
  cursor: Option<CreatedAtCursor>,
) -> Result<ImageItemResult, CommandError> {
  let result = make_query_service(&state)
    .list_image_items(FETCH_LIMIT, cursor, true, None)
    .await?;
  tracing::info!(count = result.data.len(), "Fetched images from trash");
  Ok(result)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(cursor = ?cursor))]
pub async fn fetch_favorites(
  state: State<'_, AppState>,
  cursor: Option<CreatedAtCursor>,
) -> Result<ImageItemResult, CommandError> {
  let result = make_query_service(&state)
    .list_image_items(FETCH_LIMIT, cursor, false, Some(true))
    .await?;
  tracing::info!(count = result.data.len(), "Fetched favorites images");
  Ok(result)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(cursor = ?cursor))]
pub async fn fetch_untagged_images(
  state: State<'_, AppState>,
  cursor: Option<CreatedAtCursor>,
) -> Result<ImageItemResult, CommandError> {
  let result = make_query_service(&state)
    .list_untagged_image_items(FETCH_LIMIT, cursor)
    .await?;
  tracing::info!(count = result.data.len(), "Fetched untagged images");
  Ok(result)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(cursor = ?cursor, tag_id))]
pub async fn fetch_tag_images(
  state: State<'_, AppState>,
  tag_id: i64,
  cursor: Option<CreatedAtCursor>,
) -> Result<ImageItemResult, CommandError> {
  let result = make_query_service(&state)
    .list_tagged_image_items(tag_id, FETCH_LIMIT, cursor)
    .await?;
  tracing::info!(count = result.data.len(), "Fetched images for tag");
  Ok(result)
}
