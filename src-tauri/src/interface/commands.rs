use crate::infrastructure::repo::image_repo;
use crate::state::AppState;
use crate::{application::importer, domain::dto::Image};
use tauri::{AppHandle, Manager, State};

#[tauri::command]
pub async fn load_dir(
  app: AppHandle,
  state: State<'_, AppState>,
  path: String,
) -> Result<(), String> {
  let Ok(mut app_data) = app.path().app_data_dir() else {
    // TODO: Handle error
    println!("Unable to get app data directory");
    return Err("Unable to get app data directory".to_string());
  };
  importer::import_directory(&path, &mut app_data, &state.db).await
}

#[tauri::command]
pub async fn get_loaded_files(state: State<'_, AppState>) -> Result<Vec<Image>, String> {
  let Ok(files) = image_repo::get_all_paths(&state.db).await else {
    return Err("Unable to get images".to_string());
  };

  Ok(files.into_iter().map(|file| Image::from(file)).collect())
}
