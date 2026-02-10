use crate::application::gallery;
use crate::application::importer::scan_and_process_images;
use crate::domain::dto::{Image, ImportSummary};
use crate::state::AppState;

use std::path::PathBuf;
use tauri::{AppHandle, Manager, State};

#[tauri::command]
pub async fn save_images(
  app: AppHandle,
  state: State<'_, AppState>,
  paths: Vec<String>,
) -> Result<ImportSummary, String> {
  log::info!("Save command called");
  let paths: Vec<PathBuf> = paths.into_iter().map(PathBuf::from).collect();

  let cache_dir = app.path().cache_dir().map_err(|err| {
    log::error!("Failed to load cache dir: {}", err);
    err.to_string()
  })?;

  scan_and_process_images(&state.db, &cache_dir, paths)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn load_saved_images_in_batch(
  state: State<'_, AppState>,
  offset: i64,
  limit: i64,
) -> Result<Vec<Image>, String> {
  log::info!("Load command called");
  let result = gallery::get_image_files_in_batch(&state.db, offset, limit)
    .await
    .map_err(|e| e.to_string())?;

  Ok(result)
}
