use std::path::Path;

use futures::future::join_all;
use tauri::{AppHandle, Manager};

use crate::features::{FileOps, Scanner};
use crate::models::{Image, ImageFile};
use crate::state::AppState;
use crate::storage;

#[tauri::command]
pub async fn scan_dir_for_images(path: &str) -> Result<Vec<Image>, String> {
  Image::from_dir(path)
}

#[tauri::command]
pub async fn scan_and_group_duplicates(
  path: String,
  threshold: u32,
) -> Result<Vec<Vec<Image>>, String> {
  // 'spawn_blocking' is crucial! It tells Tauri to run this on a thread
  // optimized for heavy CPU work (like image hashing).
  let result =
    tauri::async_runtime::spawn_blocking(move || Scanner::detect_duplicates(&path, threshold))
      .await
      .map_err(|e| e.to_string())??;

  Ok(result)
}

#[tauri::command]
pub async fn move_to_trash(paths: Vec<String>) -> Result<(), String> {
  let paths: Vec<&Path> = paths.iter().map(|p| Path::new(p)).collect();
  FileOps::soft_delete(&paths).map_err(|e| e.to_string())?;
  Ok(())
}

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
