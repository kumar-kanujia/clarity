use tauri::State;

use crate::{
  application::{
    pipeline::signal::PipelineSignal, service::image_mutation_service::ImageMutationService,
    workflow::image_import_wrokflow::ImageImportWorkflow,
  },
  infrastructure::repo::image_repo::ImageRepository,
  interface::{dtos::image_dto::ImportSummary, error::CommandError},
  setup::state::AppState,
};

fn make_mutation_service(state: &State<'_, AppState>) -> ImageMutationService {
  ImageMutationService::new(ImageRepository::new(state.db.clone()))
}

#[tauri::command]
#[tracing::instrument(skip(state, paths), fields(path_count = paths.len()))]
pub async fn import_images(
  state: State<'_, AppState>,
  paths: Vec<String>,
) -> Result<ImportSummary, CommandError> {
  let service = make_mutation_service(&state);
  let summary = ImageImportWorkflow::new(service)
    .scan_and_import_images(&paths)
    .await?;
  state.pipline_handle.emit(PipelineSignal::ImageAdded).await;
  tracing::info!(
    total_scanned = summary.total_scanned,
    total_imported = summary.total_imported,
    skipped = summary.skipped,
    failed = summary.failed,
    "Image import completed"
  );
  Ok(summary)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(image_id))]
pub async fn toggle_favorite(
  state: State<'_, AppState>,
  image_id: i64,
) -> Result<bool, CommandError> {
  let is_favorite = make_mutation_service(&state)
    .change_image_is_favorite(image_id)
    .await?;
  tracing::info!(image_id, is_favorite, "Image favorite toggled");
  Ok(is_favorite)
}

#[tauri::command]
#[tracing::instrument(skip(state, image_ids), fields(count = image_ids.len()))]
pub async fn move_to_trash(
  state: State<'_, AppState>,
  image_ids: Vec<i64>,
) -> Result<u64, CommandError> {
  let count = make_mutation_service(&state)
    .change_image_is_deleted(image_ids, true)
    .await?;
  tracing::info!(count, "Images moved to trash");
  Ok(count)
}

#[tauri::command]
#[tracing::instrument(skip(state, image_ids), fields(count = image_ids.len()))]
pub async fn restore_from_trash(
  state: State<'_, AppState>,
  image_ids: Vec<i64>,
) -> Result<u64, CommandError> {
  let count = make_mutation_service(&state)
    .change_image_is_deleted(image_ids, false)
    .await?;
  tracing::info!(count, "Images restored from trash");
  Ok(count)
}

#[tauri::command]
#[tracing::instrument(skip(state, image_ids), fields(count = image_ids.len()))]
pub async fn delete_from_trash(
  state: State<'_, AppState>,
  image_ids: Vec<i64>,
) -> Result<(), CommandError> {
  let count = make_mutation_service(&state)
    .hard_delete_images(&image_ids)
    .await?;
  tracing::info!(count, deleted = count > 0, "Images permanently deleted");
  if count > 0 {
    state
      .pipline_handle
      .emit(PipelineSignal::ImageDeleted)
      .await;
  }
  Ok(())
}

#[tauri::command]
#[tracing::instrument(skip(state))]
pub async fn empty_trash(state: State<'_, AppState>) -> Result<(), CommandError> {
  let count = make_mutation_service(&state)
    .hard_delete_all_images()
    .await?;
  tracing::info!(count, "Trash emptied");
  if count > 0 {
    state
      .pipline_handle
      .emit(PipelineSignal::ImageDeleted)
      .await;
  }
  Ok(())
}
