use crate::{
  application::service::gallery_query_service::GalleryQueryService,
  infrastructure::repo::image_repo::ImageRepository,
  interface::dtos::image_dto::{GalleryImageResult, ImageCursor},
  setup::settings::GALLERY_FETCH_LIMIT,
  state::AppState,
};

use tauri::State;

#[tauri::command]
pub async fn fetch_gallery(
  state: State<'_, AppState>,
  cursor: Option<ImageCursor>,
) -> Result<GalleryImageResult, String> {
  let span = tracing::info_span!("fetch_gallery");
  let _enter = span.enter();

  let repo = ImageRepository::new(state.db.clone());

  let qs = GalleryQueryService::new(repo);

  match qs.get_gallery_images(GALLERY_FETCH_LIMIT, cursor).await {
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
pub async fn toggle_favorite(state: State<'_, AppState>, image_id: i64) -> Result<bool, String> {
  let span = tracing::info_span!("toggle_favorite", image_id);
  let _enter = span.enter();

  let repo = ImageRepository::new(state.db.clone());

  let qs = GalleryQueryService::new(repo);

  match qs.change_image_is_favorite(image_id).await {
    Ok(is_favorite) => {
      tracing::info!(is_favorite, "Toggle favorite status changed:");
      Ok(is_favorite)
    }
    Err(err) => {
      tracing::error!(error = ?err, image_id = image_id, "toggle_favorite failed");
      Err(err.into())
    }
  }
}
