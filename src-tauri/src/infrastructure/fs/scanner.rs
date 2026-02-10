use walkdir::WalkDir;

use crate::domain::imagefile::ImageFile;

use std::fs;
use std::io::Error;
use std::path::{Path, PathBuf};

const IMAGE_EXTENSIONS: [&str; 7] = ["jpg", "jpeg", "png", "webp", "bmp", "gif", "heic"];

fn is_supported_image_ext(ext: &str) -> bool {
  IMAGE_EXTENSIONS
    .iter()
    .any(|&e| ext.eq_ignore_ascii_case(e))
}

pub fn is_image_file(path: &Path) -> bool {
  path
    .extension()
    .and_then(|e| e.to_str())
    .is_some_and(is_supported_image_ext)
}

pub fn scan_for_image_files(path: &Path) -> Vec<PathBuf> {
  if path.is_file() {
    return is_image_file(path)
      .then(|| vec![path.to_path_buf()])
      .unwrap_or_default();
  }

  WalkDir::new(path)
    .into_iter()
    .filter_map(Result::ok)
    .filter(|e| e.file_type().is_file())
    .map(|e| e.into_path())
    .filter(|path| is_image_file(path))
    .collect()
}

pub fn build_image_file_from_path(path: &Path) -> Result<ImageFile, Error> {
  let file_path = path.to_string_lossy().to_string();

  let file_size = fs::metadata(path)?.len() as i64;

  let (width, height) = image::image_dimensions(path).unwrap_or((0, 0));

  Ok(ImageFile {
    seq_id: 0,
    file_path,
    file_size,
    dimension_x: width,
    dimension_y: height,
  })
}
