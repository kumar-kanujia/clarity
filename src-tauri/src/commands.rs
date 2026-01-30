use std::{fs, path::PathBuf};

#[tauri::command]
pub async fn scan_folder(path: &str) -> Result<Vec<String>, String> {
  let folder_path = PathBuf::from(path);

  let result: Vec<String> = convert_images(&folder_path.display().to_string())?;

  Ok(result)
}

pub fn convert_images(folder: &str) -> Result<Vec<String>, String> {
  let folder_path = PathBuf::from(folder);

  let entries: Vec<_> = match fs::read_dir(&folder_path) {
    Ok(dir) => dir.filter_map(|e| e.ok()).collect(),
    Err(e) => return Err(format!("Failed to read directory: {}", e)),
  };

  let image_files = entries
    .into_iter()
    .filter_map(|entry| {
      let file_path = entry.path();
      if file_path.is_dir() {
        return None;
      }

      if let Some(ext) = file_path.extension().and_then(|s| s.to_str()) {
        if matches!(
          ext.to_lowercase().as_str(),
          "jpg" | "jpeg" | "png" | "webp" | "bmp" | "gif"
        ) {
          Some(file_path)
        } else {
          None
        }
      } else {
        None
      }
    })
    .map(|f| f.display().to_string())
    .collect();

  Ok(image_files)
}
