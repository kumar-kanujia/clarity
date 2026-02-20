use crate::{
  application::service::image_query_service::ImageQueryService,
  infrastructure::repo::image_repo::ImageRepository,
  interface::{
    dtos::image_dto::{CreatedAtCursor, ImageItemResult},
    error::CommandError,
  },
  setup::settings::FETCH_LIMIT,
  state::AppState,
};

use tauri::State;

#[tauri::command]
#[tracing::instrument(skip(state), fields(cursor = ?cursor))]
pub async fn fetch_gallery(
  state: State<'_, AppState>,
  cursor: Option<CreatedAtCursor>,
) -> Result<ImageItemResult, CommandError> {
  let image_repository = ImageRepository::new(state.db.clone());

  let image_query_service = ImageQueryService::new(image_repository);

  let paginated_images = image_query_service
    .list_gallery_image_items(FETCH_LIMIT, cursor)
    .await?;

  tracing::info!(
    data = paginated_images.data.len(),
    "Fetch images for gallery completed:"
  );

  Ok(paginated_images)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(cursor = ?cursor))]
pub async fn fetch_bin(
  state: State<'_, AppState>,
  cursor: Option<CreatedAtCursor>,
) -> Result<ImageItemResult, CommandError> {
  let image_repository = ImageRepository::new(state.db.clone());

  let image_query_service = ImageQueryService::new(image_repository);

  let paginated_images = image_query_service
    .list_bin_image_items(FETCH_LIMIT, cursor)
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
    .list_favorite_image_items(FETCH_LIMIT, cursor)
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
    .list_taged_image_items(tag_id, FETCH_LIMIT, cursor)
    .await?;

  tracing::info!(
    data = paginated_images.data.len(),
    "Fetch images for tag {} completed:",
    tag_id
  );

  Ok(paginated_images)
}
