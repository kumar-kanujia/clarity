use crate::features::Scanner;
use crate::models::Image;

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
    tauri::async_runtime::spawn_blocking(move || Scanner::detect_duplicates(path, threshold))
      .await
      .map_err(|e| e.to_string())??;

  Ok(result)
}
