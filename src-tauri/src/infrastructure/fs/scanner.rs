use crate::domain::imagefile::ImageFile;

use std::ffi::OsStr;
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
  path.is_file()
    && path
      .extension()
      .and_then(|e| e.to_str())
      .is_some_and(is_supported_image_ext)
}

pub fn scan_for_image_files(source: &Path) -> Vec<PathBuf> {
  if source.is_dir() {
    fs::read_dir(source)
      .into_iter()
      .flat_map(|entries| entries.flatten())
      .map(|entry| entry.path())
      .filter(|path| is_image_file(path))
      .collect()
  } else if is_image_file(source) {
    vec![source.to_path_buf()]
  } else {
    Vec::new()
  }
}

pub fn build_image_file_from_path(path: &Path, file_id: &str) -> Result<ImageFile, Error> {
  let metadata = fs::metadata(path)?;

  let (width, height) = image::image_dimensions(path).unwrap_or((0, 0));

  let image_extension = path
    .extension()
    .and_then(OsStr::to_str)
    .ok_or_else(|| Error::other("Missing image extension"))?;

  Ok(ImageFile {
    file_id: file_id.to_string(),

    filename: path
      .file_name()
      .and_then(OsStr::to_str)
      .unwrap_or("unknown")
      .to_owned(),

    image_extension: image_extension.to_owned(),

    size: metadata.len() as i64,
    dimension_x: width,
    dimension_y: height,
    original_path: path.to_str().unwrap().to_owned(),
  })
}
