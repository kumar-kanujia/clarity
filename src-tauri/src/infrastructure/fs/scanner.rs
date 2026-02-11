use walkdir::WalkDir;

use std::path::{Path, PathBuf};
use std::sync::OnceLock;

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
    .map_or(false, is_supported_image_ext)
}

pub fn perform_file_scan_for_images(path: PathBuf) -> (Vec<PathBuf>, usize) {
  let mut total_files = 0;
  let images = WalkDir::new(path)
    .into_iter()
    .filter_map(Result::ok)
    .filter(|e| e.file_type().is_file())
    .inspect(|_| total_files += 1)
    .map(|e| e.into_path())
    .filter(|p| is_image_file(p))
    .collect();

  (images, total_files)
}
