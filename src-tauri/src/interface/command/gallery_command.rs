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

#[tauri::command]
#[tracing::instrument(skip(state), fields(cursor = ?cursor))]
pub async fn fetch_all(
  state: State<'_, AppState>,
  cursor: Option<CreatedAtCursor>,
) -> Result<ImageItemResult, CommandError> {
  let image_repository = ImageRepository::new(state.db.clone());

  let image_query_service = ImageQueryService::new(image_repository);

  let paginated_images = image_query_service
    .list_image_items(FETCH_LIMIT, cursor, false, None)
    .await?;

  tracing::info!(
    data = paginated_images.data.len(),
    "Fetch images for gallery completed:"
  );

  Ok(paginated_images)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(cursor = ?cursor))]
pub async fn fetch_trash(
  state: State<'_, AppState>,
  cursor: Option<CreatedAtCursor>,
) -> Result<ImageItemResult, CommandError> {
  let image_repository = ImageRepository::new(state.db.clone());

  let image_query_service = ImageQueryService::new(image_repository);

  let paginated_images = image_query_service
    .list_image_items(FETCH_LIMIT, cursor, true, None)
    .await?;

  tracing::info!(
    data = paginated_images.data.len(),
    "Fetch images for bin completed:"
  );

  Ok(paginated_images)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(cursor = ?cursor))]
pub async fn fetch_favorites(
  state: State<'_, AppState>,
  cursor: Option<CreatedAtCursor>,
) -> Result<ImageItemResult, CommandError> {
  let image_repository = ImageRepository::new(state.db.clone());

  let image_query_service = ImageQueryService::new(image_repository);

  let paginated_images = image_query_service
    .list_image_items(FETCH_LIMIT, cursor, false, Some(true))
    .await?;

  tracing::info!(
    data = paginated_images.data.len(),
    "Fetch images for favorites completed:"
  );

  Ok(paginated_images)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(cursor = ?cursor, tag_id = tag_id))]
pub async fn fetch_tag_gallery(
  state: State<'_, AppState>,
  tag_id: i64,
  cursor: Option<CreatedAtCursor>,
) -> Result<ImageItemResult, CommandError> {
  let image_repository = ImageRepository::new(state.db.clone());

  let image_query_service = ImageQueryService::new(image_repository);

  let paginated_images = image_query_service
    .list_tagged_image_items(tag_id, FETCH_LIMIT, cursor)
    .await?;

  tracing::info!(
    data = paginated_images.data.len(),
    tag_id = tag_id,
    "Fetch images for tag completed"
  );

  Ok(paginated_images)
}
