use crate::{
  application::service::image_query_service::ImageQueryService,
  infrastructure::repo::image_repo::ImageRepository,
  interface::dtos::image_dto::{CreatedAtCursor, ImageItemResult},
  setup::settings::FETCH_LIMIT,
  state::AppState,
};

use tauri::State;

#[tauri::command]
pub async fn fetch_gallery(
  state: State<'_, AppState>,
  cursor: Option<CreatedAtCursor>,
) -> Result<ImageItemResult, String> {
  let span = tracing::info_span!("fetch_gallery");
  let _enter = span.enter();

  let repo = ImageRepository::new(state.db.clone());

  let qs = ImageQueryService::new(repo);

  match qs.list_gallery_image_items(FETCH_LIMIT, cursor).await {
    Ok(paginated_images) => {
      tracing::info!(
        data = paginated_images.data.len(),
        "Fetch images for gallery completed:"
      );
      Ok(paginated_images)
    }
    Err(err) => {
      tracing::error!(error = ?err, "fetch_gallery failed");
      Err(err.into())
    }
  }
}

#[tauri::command]
pub async fn fetch_bin(
  state: State<'_, AppState>,
  cursor: Option<CreatedAtCursor>,
) -> Result<ImageItemResult, String> {
  let span = tracing::info_span!("fetch_bin");
  let _enter = span.enter();

  let repo = ImageRepository::new(state.db.clone());

  let qs = ImageQueryService::new(repo);

  match qs.list_bin_image_items(FETCH_LIMIT, cursor).await {
    Ok(paginated_images) => {
      tracing::info!(
        data = paginated_images.data.len(),
        "Fetch images for bin completed:"
      );
      Ok(paginated_images)
    }
    Err(err) => {
      tracing::error!(error = ?err, "fetch_bin failed");
      Err(err.into())
    }
  }
}

#[tauri::command]
pub async fn fetch_favorites(
  state: State<'_, AppState>,
  cursor: Option<CreatedAtCursor>,
) -> Result<ImageItemResult, String> {
  let span = tracing::info_span!("fetch_favorites");
  let _enter = span.enter();

  let repo = ImageRepository::new(state.db.clone());

  let qs = ImageQueryService::new(repo);

  match qs.list_favorite_image_items(FETCH_LIMIT, cursor).await {
    Ok(paginated_images) => {
      tracing::info!(
        data = paginated_images.data.len(),
        "Fetch images for favorites completed:"
      );
      Ok(paginated_images)
    }
    Err(err) => {
      tracing::error!(error = ?err, "fetch_favorites failed");
      Err(err.into())
    }
  }
}

#[tauri::command]
pub async fn fetch_tag_gallery(
  state: State<'_, AppState>,
  tag_id: i64,
  cursor: Option<CreatedAtCursor>,
) -> Result<ImageItemResult, String> {
  let span = tracing::info_span!("fetch_tag_gallery", tag_id);
  let _enter = span.enter();

  let repo = ImageRepository::new(state.db.clone());

  let qs = ImageQueryService::new(repo);

  match qs.list_taged_image_items(tag_id, FETCH_LIMIT, cursor).await {
    Ok(paginated_images) => {
      tracing::info!(
        data = paginated_images.data.len(),
        "Fetch images for tag {} completed:",
        tag_id
      );
      Ok(paginated_images)
    }
    Err(err) => {
      tracing::error!(error = ?err, "fetch_tag_gallery failed");
      Err(err.into())
    }
  }
}
