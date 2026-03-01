use crate::{
  application::{
    service::image_mutation_service::ImageMutationService,
    workflow::image_import_wrokflow::ImageImportWorkflow,
  },
  infrastructure::repo::image_repo::ImageRepository,
  interface::{dtos::image_dto::ImportSummary, error::CommandError},
  setup::state::AppState,
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

  let image_import_workflow = ImageImportWorkflow::new(image_mutation_service);

  let (summary, new_images) = image_import_workflow.scan_and_import_images(&paths).await?;

  for image in new_images {
    state.pipline.ingest(image).await;
  }

  tracing::info!(
    total_scanned = summary.total_scanned,
    total_imported = summary.total_imported,
    walk_errors = summary.skipped,
    total_failed = summary.failed,
    "Import images completed!"
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
    "Image favorite toggle completed!"
  );

  Ok(is_favorite)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(count = image_ids.len()))]
pub async fn move_to_trash(
  state: State<'_, AppState>,
  image_ids: Vec<i64>,
) -> Result<u64, CommandError> {
  let image_repository = ImageRepository::new(state.db.clone());

  let image_mutation_service = ImageMutationService::new(image_repository);

  let count = image_mutation_service
    .change_image_is_deleted(image_ids, true)
    .await?;

  tracing::info!("{} images moved to trash!", count);

  Ok(count)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(count = image_ids.len()))]
pub async fn restore_from_trash(
  state: State<'_, AppState>,
  image_ids: Vec<i64>,
) -> Result<u64, CommandError> {
  let image_repository = ImageRepository::new(state.db.clone());

  let image_mutation_service = ImageMutationService::new(image_repository);

  let count = image_mutation_service
    .change_image_is_deleted(image_ids, false)
    .await?;

  tracing::info!("{} images restored from trash!", count);

  Ok(count)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(count = image_ids.len()))]
pub async fn remove_from_trash(
  state: State<'_, AppState>,
  image_ids: Vec<i64>,
) -> Result<(), CommandError> {
  let image_repository = ImageRepository::new(state.db.clone());

  let image_mutation_service = ImageMutationService::new(image_repository);

  let images = image_mutation_service
    .hard_delete_images(&image_ids)
    .await?;

  for image in images {
    state.pipline.ingest(image).await;
  }

  tracing::info!("Image soft delete completed!");

  Ok(())
}

#[tauri::command]
#[tracing::instrument(skip(state))]
pub async fn empty_trash(state: State<'_, AppState>) -> Result<(), CommandError> {
  let image_repository = ImageRepository::new(state.db.clone());

  let image_mutation_service = ImageMutationService::new(image_repository);

  let images = image_mutation_service.hard_delete_all_images().await?;

  for image in images {
    state.pipline.ingest(image).await;
  }

  tracing::info!("Empty bin completed!");

  Ok(())
}
