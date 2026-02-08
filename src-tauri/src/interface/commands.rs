use crate::application::library;
use crate::state::AppState;
use crate::{application::importer, domain::dto::Image};

use std::path::Path;
use tauri::{AppHandle, Manager, State};

#[tauri::command]
pub async fn load_dir(
  app: AppHandle,
  state: State<'_, AppState>,
  path: String,
) -> Result<(), String> {
  let Ok(app_data) = app.path().app_data_dir() else {
    println!("Unable to get app data directory");
    return Err("Unable to get app data directory".to_string());
  };

  let source = Path::new(&path);

  importer::import_directory(source, &app_data, &state.db)
    .await
    .map_err(|err| {
      println!("Error: {:?}", err);
      err.to_string()
    })
}

#[tauri::command]
pub async fn get_loaded_files(
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
