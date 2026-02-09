use crate::application::{importer::import_images, library};
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
  let Ok(app_data) = app.path().app_data_dir() else {
    println!("Unable to get app data directory");
    return Err("Unable to get app data directory".to_string());
  };

  let paths: Vec<PathBuf> = paths.into_iter().map(PathBuf::from).collect();

  import_images(paths, &app_data, &state.db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_saved_images(
  app: AppHandle,
  state: State<'_, AppState>,
) -> Result<Vec<Image>, String> {
  let Ok(mut app_data) = app.path().app_data_dir() else {
    // TODO: Handle error
    println!("Unable to get app data directory");
    return Err("Unable to get app data directory".to_string());
  };

  let result = library::get_image_files(&mut app_data, &state.db)
    .await
    .map_err(|e| e.to_string())?;

  Ok(result)
}
