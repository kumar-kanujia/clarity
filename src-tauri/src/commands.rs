use futures::future::join_all;
use tauri::{AppHandle, Manager};

use crate::{model::ImageFile, state::AppState, storage};

#[tauri::command]
pub async fn load_dir(
  app: AppHandle,
  state: tauri::State<'_, AppState>,
  path: String,
) -> Result<(), String> {
  let target = app.path().app_data_dir().unwrap();
  let loaded_files = storage::load_dir(&path, target.to_str().unwrap());

  let futures = loaded_files.into_iter().filter_map(|file| {
    ImageFile::from_path(&file, None).ok().map(async |image| {
      image.save_db(&state.db).await;
    })
  });

  println!("futures: {:?}", futures);

  join_all(futures).await;

  println!("futures done");

  Ok(())
}

#[tauri::command]
pub async fn get_loaded_files(state: tauri::State<'_, AppState>) -> Result<Vec<String>, String> {
  let loaded_files = storage::get_loaded_files(&state.db).await;
  Ok(loaded_files)
}
