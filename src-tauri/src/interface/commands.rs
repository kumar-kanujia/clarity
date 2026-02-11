use crate::application::dto::{Image, ImportSummary};
use crate::application::gallery;
use crate::application::importer::scan_and_import_images;
use crate::error::user_friendly_message;
use crate::state::AppState;

use std::path::PathBuf;
use tauri::State;

#[tauri::command]
pub async fn save_images(
  state: State<'_, AppState>,
  paths: Vec<String>,
) -> Result<ImportSummary, String> {
  let paths: Vec<PathBuf> = paths.into_iter().map(PathBuf::from).collect();

  match scan_and_import_images(&state.db, paths).await {
    Ok(summary) => Ok(summary),
    Err(err) => {
      log::error!("Import failed: {:?}", err);
      Err(user_friendly_message(&err))
    }
  }
}

#[tauri::command]
pub async fn load_saved_images(
  state: State<'_, AppState>,
  offset: i64,
  limit: i64,
) -> Result<Vec<Image>, String> {
  log::info!("Load command called");
  let result = gallery::load_saved_images_in_batch(&state.db, offset, limit)
    .await
    .map_err(|e| {
      log::error!("Failed to load images: {}", e);
      e.to_string()
    })?;

  Ok(result)
}
