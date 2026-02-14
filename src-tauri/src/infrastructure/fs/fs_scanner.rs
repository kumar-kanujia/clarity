use crate::{
  domain::{file::file_scan::FileScanResult, image::Image},
  infrastructure::fs::error::FSError,
};

use walkdir::WalkDir;

use std::path::Path;

pub struct FileScanner;

impl FileScanner {
  fn is_supported_image_ext(ext: &str) -> bool {
    Image::get_extensions()
      .iter()
      .any(|&e| ext.eq_ignore_ascii_case(e))
  }

  fn is_image_file(path: &Path) -> bool {
    path
      .extension()
      .and_then(|e| e.to_str())
      .is_some_and(Self::is_supported_image_ext)
  }

  pub fn scan_path_for_images(path: &Path) -> Result<FileScanResult, FSError> {
    if !path.exists() {
      return Err(FSError::InvalidRoot(path.display().to_string()));
    }

    let mut files = Vec::new();

    let mut total_files = 0;
    let mut walk_errors = 0;

    for entry in WalkDir::new(&path) {
      if let Ok(entry) = entry {
        if entry.file_type().is_file() {
          total_files += 1;
          let file_path = entry.into_path();
          if Self::is_image_file(&file_path) {
            files.push(file_path);
          }
        }
      } else {
        walk_errors += 1;
        continue;
      }
    }

    Ok(FileScanResult {
      files,
      total_files,
      walk_errors,
    })
  }
}
