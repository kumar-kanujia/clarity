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

#[cfg(test)]
mod tests {

  use super::*;
  use std::fs::File;
  use tempfile::tempdir;

  #[test]
  fn test_is_supported_image_ext() {
    assert!(is_supported_image_ext("jpg"));
    assert!(is_supported_image_ext("JPG")); // Check case insensitivity
    assert!(is_supported_image_ext("png"));
    assert!(!is_supported_image_ext("txt"));
    assert!(!is_supported_image_ext("exe"));
  }

  #[test]
  fn test_is_image_file() {
    assert!(is_image_file(Path::new("photo.jpg")));
    assert!(is_image_file(Path::new("vacation/beach.PNG")));
    assert!(!is_image_file(Path::new("notes.txt")));
    assert!(!is_image_file(Path::new("no_extension")));
  }

  #[test]
  fn test_scan_path_invalid_root() {
    let result = scan_path_for_images(Path::new("/non/existent/path/at/all"));
    assert!(matches!(result, Err(FSError::InvalidRoot(_))));
  }

  #[test]
  fn test_scan_path_success() -> Result<(), Box<dyn std::error::Error>> {
    // 1. Create a temporary directory
    let dir = tempdir()?;
    let root = dir.path();

    // 2. Setup a mix of files
    // Valid images
    File::create(root.join("img1.jpg"))?;
    File::create(root.join("img2.png"))?;

    // Nested directory with an image
    let sub = root.join("subdir");
    std::fs::create_dir(&sub)?;
    File::create(sub.join("img3.jpg"))?;

    // Non-image files
    File::create(root.join("README.md"))?;
    File::create(root.join(".hidden_image.jpg"))?; // Should be skipped by .skip_hidden(true)

    // 3. Run the scan
    let summary = scan_path_for_images(root)?;

    // 4. Assertions
    // Expecting 3 images (img1, img2, img3). Hidden file is skipped.
    assert_eq!(summary.files.len(), 3);

    // total_files counts all non-hidden files encountered
    // (img1, img2, img3, README.md) = 4
    assert_eq!(summary.total_files, 4);
    assert_eq!(summary.walk_errors, 0);

    Ok(())
  }
}
