use crate::{
  application::{
    service::{file_scan_service::FileScanService, image_mutation_service::ImageMutationService},
    workflow::scan_and_import_images::ScanAndImportImages,
  },
  infrastructure::repo::image_repo::ImageRepository,
  interface::dtos::image_dto::ImportSummary,
  state::AppState,
};

use tauri::State;

#[tauri::command]
pub async fn import_images(
  state: State<'_, AppState>,
  paths: Vec<String>,
) -> Result<ImportSummary, String> {
  let span = tracing::info_span!("import_images", paths = paths.len());
  let _enter = span.enter();

  let repo = ImageRepository::new(state.db.clone());

  let mutation_service = ImageMutationService::new(repo);

  let file_service = FileScanService::default();

  let wf = ScanAndImportImages::new(mutation_service, file_service);

  match wf.scan_and_import_images(&paths).await {
    Ok(summary) => {
      tracing::info!("Import completed");
      Ok(summary)
    }
    Err(err) => {
      tracing::error!(
          error = ?err,
          "Import failed"
      );
      Err(err.into())
    }
  }
}

#[tauri::command]
pub async fn toggle_favorite(state: State<'_, AppState>, image_id: i64) -> Result<bool, String> {
  let span = tracing::info_span!("toggle_favorite", image_id);
  let _enter = span.enter();

  let repo = ImageRepository::new(state.db.clone());

  let ms = ImageMutationService::new(repo);

  match ms.change_image_is_favorite(image_id).await {
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

#[tauri::command]
pub async fn soft_delete_image(state: State<'_, AppState>, image_id: i64) -> Result<bool, String> {
  let span = tracing::info_span!("soft_delete_image", image_id);
  let _enter = span.enter();

  let repo = ImageRepository::new(state.db.clone());

  let ms = ImageMutationService::new(repo);

  match ms.change_image_is_deleted(image_id, true).await {
    Ok(is_deleted) => {
      tracing::info!(is_deleted, "Image marked as deleted: {}", image_id);
      Ok(is_deleted)
    }
    Err(err) => {
      tracing::error!(error = ?err, image_id = image_id, "soft_delete_image failed");
      Err(err.into())
    }
  }
}

#[tauri::command]
pub async fn undo_soft_delete_image(
  state: State<'_, AppState>,
  image_id: i64,
) -> Result<bool, String> {
  let span = tracing::info_span!("undo_soft_delete_image", image_id);
  let _enter = span.enter();

  let repo = ImageRepository::new(state.db.clone());

  let ms = ImageMutationService::new(repo);

  match ms.change_image_is_deleted(image_id, false).await {
    Ok(is_deleted) => {
      tracing::info!(is_deleted, "Image unmarked as deleted: {}", image_id);
      Ok(is_deleted)
    }
    Err(err) => {
      tracing::error!(error = ?err, image_id = image_id, "undo_soft_delete_image failed");
      Err(err.into())
    }
  }
}
