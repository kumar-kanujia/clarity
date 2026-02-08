use crate::domain::imagefile::ImageFile;

use std::ffi::OsStr;
use std::fs;
use std::io::Error;
use std::path::{Path, PathBuf};

const IMAGE_EXTENSIONS: [&str; 6] = ["jpg", "jpeg", "png", "webp", "bmp", "gif"];

fn is_image_file(path: &Path) -> bool {
  path.is_file()
    && path
      .extension()
      .and_then(|e| e.to_str())
      .map(str::to_lowercase)
      .is_some_and(|e| IMAGE_EXTENSIONS.contains(&e.as_str()))
}

pub fn scan_for_images(source: &Path) -> Vec<PathBuf> {
  let mut files = Vec::new();
  if source.is_dir() {
    if let Ok(entries) = fs::read_dir(source) {
      for entry in entries.flatten() {
        let path = entry.path();
        if is_image_file(&path) {
          files.push(path);
        }
      }
    }
  } else if is_image_file(source) {
    files.push(source.to_path_buf());
  }
  files
}

pub fn build_image_file_from_path(path: &Path, file_id: &str) -> Result<ImageFile, Error> {
  let filename = path
    .file_name()
    .and_then(OsStr::to_str)
    .unwrap_or("unknown")
    .to_string();

  let meta = fs::metadata(path)?;

  let size = meta.len();

  let image_extension = path
    .extension()
    .and_then(OsStr::to_str)
    .unwrap_or("jpg")
    .to_string();

  let dimensions = image::image_dimensions(path).unwrap_or((0, 0));

  let mut image_file = ImageFile::default();

  image_file.file_id = file_id.to_string();
  image_file.filename = filename;
  image_file.size = size as u32;
  image_file.dimension_x = dimensions.0;
  image_file.dimension_y = dimensions.1;
  image_file.image_extension = image_extension;

  Ok(image_file)
}
