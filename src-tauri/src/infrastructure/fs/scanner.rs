use walkdir::WalkDir;

use crate::domain::imagefile::ImageFile;

use std::fs;
use std::io::Error;
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

pub fn perform_file_scan(path: PathBuf) -> (Vec<PathBuf>, usize) {
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

pub fn build_image_file_with_metadata(path: &Path) -> Result<ImageFile, Error> {
  let file_path = path.to_string_lossy().to_string();

  let file_size = fs::metadata(path)?.len().cast_signed();

  let (width, height) =
    image::image_dimensions(path).map_err(|e| Error::other(format!("Metadata error: {}", e)))?;

  Ok(ImageFile {
    seq_id: 0,
    file_path,
    file_size,
    dimension_x: width,
    dimension_y: height,
  })
}

pub fn build_image_file_witout_metadata(path: &Path) -> ImageFile {
  let file_path = path.to_string_lossy().to_string();
  ImageFile {
    seq_id: 0,
    file_path,
    file_size: 0,
    dimension_x: 0,
    dimension_y: 0,
  }
}
