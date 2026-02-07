use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};

pub const IMAGE_FILE_EXTENSIONS: [&str; 6] = ["jpg", "jpeg", "png", "webp", "bmp", "gif"];

#[derive(Serialize, Clone, Debug)]
pub struct Image {
  /// e.g., "/Users/kk/Pictures/image.jpg"
  pub path: String,
  /// e.g., "image.jpg"
  pub filename: String,
  pub size_bytes: u64,
  /// e.g., "100.0 KB"
  pub size: String,
  /// e.g., "1920x1080"
  pub resolution: String,
}

impl Image {
  // Get the size of the file in human readable format
  // e.g., "100.0 KB", "1.2 MB", "5.1 GB"
  #[allow(clippy::cast_possible_truncation)]
  fn get_size(size_bytes: u64) -> String {
    if size_bytes < 1024 {
      format!("{:.2} KB", size_bytes as f64 / 1000.0) // NOLINT
    } else if size_bytes < 1024 * 1024 {
      format!("{:.2} MB", size_bytes as f64 / 1000.0 / 1000.0)
    } else {
      format!("{:.2} GB", size_bytes as f64 / 1000.0 / 1000.0 / 1000.0)
    }
  }

  // Create Image object assuming the path is for Image file
  fn from_path(file_path: &Path) -> Option<Self> {
    // Get file metadata
    let fs_meta = fs::metadata(file_path).ok()?;

    // Get image dimensions
    let dimensions = image::image_dimensions(file_path).unwrap_or((0, 0));

    let path = file_path.to_string_lossy().to_string();

    let filename = file_path.file_name()?.to_string_lossy().to_string();

    let size_bytes = fs_meta.len();

    let size = Self::get_size(size_bytes);

    // Format the resolution
    let resolution = format!("{}x{}", dimensions.0, dimensions.1);

    Some(Image {
      path,
      filename,
      size_bytes,
      size,
      resolution,
    })
  }

  pub fn from_dir(path: &str) -> Result<Vec<Self>, String> {
    let dirpath = PathBuf::from(path);

    // Reading all files in the directory
    let all_file_entries: Vec<_> = match fs::read_dir(&dirpath) {
      Ok(dir) => dir.filter_map(|e| e.ok()).collect(),
      Err(e) => return Err(format!("Failed to read directory: {}", e)),
    };

    // Collecting Only Images
    let images = all_file_entries
      .into_iter()
      .filter_map(|dir_entry| {
        let file_path = dir_entry.path();

        // Skip directories
        if file_path.is_dir() {
          return None;
        }

        // Check if file has an extension
        if let Some(ext) = file_path
          .extension()
          // Skip non-image files
          .and_then(|s| s.to_str())
        {
          if IMAGE_FILE_EXTENSIONS.contains(&ext) {
            return Some(file_path);
          }
          None
        }
        // Skip non-extension files
        else {
          None
        }
      })
      .filter_map(|f| Self::from_path(&f))
      .collect();

    Ok(images)
  }
}
