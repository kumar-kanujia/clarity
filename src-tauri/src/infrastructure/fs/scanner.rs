use std::fs;
use std::path::{Path, PathBuf};

use crate::domain::imagefile::ImageFile;

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

pub fn extract_metadata(
  path: &Path,
  original_path: Option<&Path>,
) -> Result<ImageFile, std::io::Error> {
  let filename = path.file_name().unwrap().to_str().unwrap().to_string();

  let size_bytes = fs::metadata(path)?.len();

  #[allow(clippy::cast_precision_loss)]
  let size_string = ImageFile::size_string(size_bytes as f64);

  let dimensions = image::image_dimensions(path).unwrap_or((0, 0));

  let image_extension = path
    .extension()
    .and_then(|s| s.to_str())
    .unwrap_or("")
    .to_string();

  let original_path = match original_path {
    Some(original_path) => original_path.to_str().unwrap().to_string(),
    None => String::new(),
  };

  Ok(ImageFile {
    id: 0,
    filename,
    path: path.to_str().unwrap().to_string(),
    #[allow(clippy::cast_possible_truncation)]
    size_bytes: u32::try_from(size_bytes).unwrap_or(0),
    size_string,
    dimension_x: dimensions.0,
    dimension_y: dimensions.1,
    dimension_string: ImageFile::dimensions_string(dimensions.0, dimensions.1),
    image_extension,
    original_path,
    mean_hash: String::new(),
  })
}

#[cfg(test)]
mod scan_for_images_tests {
  use super::*;
  use std::fs;
  use tempfile::tempdir;

  #[test]
  fn scans_directory_and_returns_only_image_files() {
    let temp = tempdir().unwrap();

    let img1 = temp.path().join("a.jpg");
    let img2 = temp.path().join("b.png");
    let txt = temp.path().join("notes.txt");

    fs::write(&img1, "fake").unwrap();
    fs::write(&img2, "fake").unwrap();
    fs::write(&txt, "fake").unwrap();

    let files = scan_for_images(temp.path());

    assert_eq!(files.len(), 2);
    assert!(files.contains(&img1));
    assert!(files.contains(&img2));
  }

  #[test]
  fn returns_single_file_when_source_is_image_file() {
    let temp = tempdir().unwrap();
    let img = temp.path().join("photo.webp");

    fs::write(&img, "fake").unwrap();

    let files = scan_for_images(&img);

    assert_eq!(files, vec![img]);
  }

  #[test]
  fn returns_empty_when_no_images_found() {
    let temp = tempdir().unwrap();
    let txt = temp.path().join("file.txt");

    fs::write(&txt, "fake").unwrap();

    let files = scan_for_images(temp.path());

    assert!(files.is_empty());
  }
}

#[cfg(test)]
mod extract_metadata_tests {
  use super::*;
  use std::path::Path;
  use tempfile::tempdir;

  fn create_test_image(path: &Path, width: u32, height: u32) {
    let img = image::RgbImage::new(width, height);
    img.save(path).unwrap();
  }

  #[test]
  fn extracts_correct_metadata_from_image() {
    let temp = tempdir().unwrap();
    let img_path = temp.path().join("test.png");

    create_test_image(&img_path, 128, 64);

    let metadata = extract_metadata(&img_path, None).unwrap();

    assert_eq!(metadata.filename, "test.png");
    assert_eq!(metadata.dimension_x, 128);
    assert_eq!(metadata.dimension_y, 64);
    assert_eq!(metadata.dimension_string, "128x64");
    assert_eq!(metadata.image_extension, "png");
    assert_eq!(metadata.original_path, "");
    assert!(metadata.size_bytes > 0);
    assert!(!metadata.size_string.is_empty());
  }

  #[test]
  fn preserves_original_path_when_provided() {
    let temp = tempdir().unwrap();
    let img_path = temp.path().join("original.jpg");

    create_test_image(&img_path, 10, 10);

    let original = Path::new("/some/original/location.jpg");

    let metadata = extract_metadata(&img_path, Some(original)).unwrap();

    assert_eq!(metadata.original_path, "/some/original/location.jpg");
  }
}
