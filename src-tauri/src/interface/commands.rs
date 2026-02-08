use crate::application::importer::import_images;
use crate::application::library;
use crate::state::AppState;
use crate::{application::importer, domain::dto::Image};

use std::path::PathBuf;
use tauri::{AppHandle, Manager, State};

#[tauri::command]
pub async fn save_images(
  app: AppHandle,
  state: State<'_, AppState>,
  files: Vec<String>,
) -> Result<(), String> {
  let Ok(app_data) = app.path().app_data_dir() else {
    println!("Unable to get app data directory");
    return Err("Unable to get app data directory".to_string());
  };

  let paths: Vec<PathBuf> = files.into_iter().map(PathBuf::from).collect();

  if let Err(err) = import_images(paths, &app_data, &state.db).await {
    eprintln!("Import failed: {}", err);
  }

  Ok(())
}

#[tauri::command]
pub async fn save_dirs(
  app: AppHandle,
  state: State<'_, AppState>,
  paths: Vec<String>,
) -> Result<(), String> {
  let Ok(app_data) = app.path().app_data_dir() else {
    println!("Unable to get app data directory");
    return Err("Unable to get app data directory".to_string());
  };

  let paths: Vec<PathBuf> = paths.into_iter().map(PathBuf::from).collect();

  importer::import_paths(paths, &app_data, &state.db)
    .await
    .map_err(|err: std::io::Error| {
      println!("Error: {:?}", err);
      err.to_string()
    })
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
