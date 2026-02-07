use std::path::Path;

use crate::old::{
  features::{FileOps, Scanner},
  image::Image,
};

mod features;
mod image;

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
