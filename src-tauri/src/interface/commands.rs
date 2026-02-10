use crate::application::importer::scan_and_process_images;
use crate::application::library;
use crate::domain::dto::{Image, ImportSummary};
use crate::state::AppState;

use std::path::PathBuf;
use tauri::{AppHandle, State};

#[tauri::command]
pub async fn save_images(
  state: State<'_, AppState>,
  paths: Vec<String>,
) -> Result<ImportSummary, String> {
  let paths: Vec<PathBuf> = paths.into_iter().map(PathBuf::from).collect();

  scan_and_process_images(&state.db, paths)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn load_saved_images_in_batch(
  state: State<'_, AppState>,
  offset: i64,
  limit: i64,
) -> Result<Vec<Image>, String> {
  let result = library::get_image_files_in_batch(&state.db, offset, limit)
    .await
    .map_err(|e| e.to_string())?;

  Ok(result)
}
