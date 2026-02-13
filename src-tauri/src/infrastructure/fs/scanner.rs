use crate::infrastructure::fs::error::FSError;

use walkdir::WalkDir;

use std::path::{Path, PathBuf};
use std::sync::OnceLock;

pub struct ScanResult {
  pub images: Vec<PathBuf>,
  pub total_files: i64,
  pub walk_errors: i64,
}

static IMAGE_EXTENSIONS: OnceLock<Vec<&'static str>> = OnceLock::new();

fn get_extensions() -> &'static [&'static str] {
  IMAGE_EXTENSIONS.get_or_init(|| vec!["jpg", "jpeg", "png", "webp", "bmp", "gif", "heic"])
}

pub fn is_supported_image_ext(ext: &str) -> bool {
  get_extensions()
    .iter()
    .any(|&e| ext.eq_ignore_ascii_case(e))
}

pub fn is_image_file(path: &Path) -> bool {
  path
    .extension()
    .and_then(|e| e.to_str())
    .is_some_and(is_supported_image_ext)
}

pub fn perform_file_scan_for_images(path: &PathBuf) -> Result<ScanResult, FSError> {
  if !path.exists() {
    return Err(FSError::InvalidRoot(path.display().to_string()));
  }

  let mut total_files = 0;
  let mut images = Vec::new();
  let mut walk_errors = 0;

  for entry in WalkDir::new(&path) {
    if let Ok(entry) = entry {
      if entry.file_type().is_file() {
        total_files += 1;

        let path = entry.into_path();

        if is_image_file(&path) {
          images.push(path);
        }
      }
    } else {
      walk_errors += 1;
      continue;
    }
  }

  Ok(ScanResult {
    images,
    total_files,
    walk_errors,
  })
}
