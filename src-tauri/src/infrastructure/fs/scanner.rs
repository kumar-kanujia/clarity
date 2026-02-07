use std::fs;
use std::path::{Path, PathBuf};

use crate::domain::entity::ImageFile;

const IMAGE_EXTENSIONS: [&str; 6] = ["jpg", "jpeg", "png", "webp", "bmp", "gif"];

fn is_image_file(path: &Path) -> bool {
  path.is_file()
    && path
      .extension()
      .and_then(|e| e.to_str())
      .map(|e| IMAGE_EXTENSIONS.contains(&e))
      .unwrap_or(false)
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

pub fn extract_metadata(
  path: &Path,
  original_path: Option<&Path>,
) -> Result<ImageFile, std::io::Error> {
  let filename = path.file_name().unwrap().to_str().unwrap().to_string();

  let size_bytes = fs::metadata(path)?.len();

  let size_string = ImageFile::size_string(size_bytes as f32);

  let dimensions = image::image_dimensions(path).unwrap_or((0, 0));

  let image_extension = path
    .extension()
    .and_then(|s| s.to_str())
    .unwrap_or("")
    .to_string();

  let original_path = match original_path {
    Some(original_path) => original_path.to_str().unwrap().to_string(),
    None => "".to_string(),
  };

  Ok(ImageFile {
    id: 0,
    filename,
    path: path.to_str().unwrap().to_string(),
    size_bytes: size_bytes as u32,
    size_string,
    dimension_x: dimensions.0,
    dimension_y: dimensions.1,
    dimension_string: ImageFile::dimensions_string(dimensions.0, dimensions.1),
    image_extension,
    original_path,
    mean_hash: "".to_string(), // Ready for future hash implementation
  })
}
