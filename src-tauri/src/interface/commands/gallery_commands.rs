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
