use crate::{
  application::{
    service::{file_scan_service::FileScanService, image_mutation_service::ImageMutationService},
    workflow::image_import_wrokflow::ImageImportWorkflow,
  },
  infrastructure::repo::image_repo::ImageRepository,
  interface::{dtos::image_dto::ImportSummary, error::CommandError},
  state::AppState,
};

use tauri::State;

#[tauri::command]
#[tracing::instrument(skip(state, paths), fields(path_count = paths.len()))]
pub async fn import_images(
  state: State<'_, AppState>,
  paths: Vec<String>,
) -> Result<ImportSummary, CommandError> {
  let image_repository = ImageRepository::new(state.db.clone());

  let image_mutation_service = ImageMutationService::new(image_repository);

  let file_scan_service = FileScanService::default();

  let image_import_workflow = ImageImportWorkflow::new(image_mutation_service, file_scan_service);

  let summary = image_import_workflow.scan_and_import_images(&paths).await?;

  tracing::info!(
    total_scanned = summary.total_scanned,
    total_imported = summary.total_imported,
    walk_errors = summary.skipped,
    total_failed = summary.failed,
    "Import images completed:"
  );

  Ok(summary)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(image_id = image_id))]
pub async fn toggle_favorite(
  state: State<'_, AppState>,
  image_id: i64,
) -> Result<bool, CommandError> {
  let image_repository = ImageRepository::new(state.db.clone());

  let image_mutation_service = ImageMutationService::new(image_repository);

  let is_favorite = image_mutation_service
    .change_image_is_favorite(image_id)
    .await?;

  tracing::info!(
    is_favorite = is_favorite,
    "Image favorite toggle completed:"
  );

  Ok(is_favorite)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(image_id = image_id))]
pub async fn soft_delete_image(
  state: State<'_, AppState>,
  image_id: i64,
) -> Result<bool, CommandError> {
  let image_repository = ImageRepository::new(state.db.clone());

  let image_mutation_service = ImageMutationService::new(image_repository);

  let is_deleted = image_mutation_service
    .change_image_is_deleted(image_id, true)
    .await?;

  tracing::info!(is_deleted = is_deleted, "Image soft delete completed:");

  Ok(is_deleted)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(image_id = image_id))]
pub async fn undo_soft_delete_image(
  state: State<'_, AppState>,
  image_id: i64,
) -> Result<bool, CommandError> {
  let image_repository = ImageRepository::new(state.db.clone());

  let image_mutation_service = ImageMutationService::new(image_repository);

  let is_deleted = image_mutation_service
    .change_image_is_deleted(image_id, false)
    .await?;

  tracing::info!(is_deleted = is_deleted, "Image undo soft delete completed:");

  Ok(is_deleted)
}
