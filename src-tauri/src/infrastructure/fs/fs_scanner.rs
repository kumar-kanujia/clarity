use crate::{
  domain::{file::FileScanSummary, image::Image},
  infrastructure::fs::error::FSError,
};

use jwalk::WalkDir;
use std::path::Path;

fn is_supported_image_ext(ext: &str) -> bool {
  let ext_lower = ext.to_ascii_lowercase();
  Image::get_extensions().iter().any(|&e| e == ext_lower)
}

fn is_image_file(path: &Path) -> bool {
  path
    .extension()
    .and_then(|e| e.to_str())
    .is_some_and(is_supported_image_ext)
}

pub fn scan_path_for_images(path: &Path) -> Result<FileScanSummary, FSError> {
  if !path.exists() {
    return Err(FSError::InvalidRoot(path.display().to_string()));
  }

  let mut files = Vec::new();
  let mut total_files = 0;
  let mut walk_errors = 0;

  for entry in WalkDir::new(path).skip_hidden(true) {
    match entry {
      Ok(entry) if entry.file_type().is_file() => {
        total_files += 1;

        let file_path = entry.path();
        if is_image_file(&file_path) {
          files.push(file_path);
        }
      }
      Ok(_) => {} // Safely ignore directories
      Err(_) => {
        walk_errors += 1;
      }
    }
  }

  Ok(FileScanSummary {
    files,
    total_files,
    walk_errors,
  })
}
