use crate::{
  domain::image::{Image, ImageMetadata},
  error::AppError,
  infrastructure::{fs::ops, processing::thumbnail::ThumbnailP},
};

use std::{
  panic,
  path::{Path, PathBuf},
};

use rayon::iter::{IntoParallelRefMutIterator, ParallelIterator};
use tauri::{AppHandle, Manager};

pub struct ThumbnailService;

impl ThumbnailService {
  pub fn get_thumbnail_target(app: &AppHandle) -> Result<PathBuf, AppError> {
    let cache_dir = app.path().app_data_dir().map_err(AppError::Internal)?;
    let target_dir = cache_dir.join("org.clarity").join(".thumbnails");
    ops::ensure_dir(&target_dir)?;
    Ok(target_dir)
  }

  pub fn process_batch(files: &mut [Image], thumbnail_target: &Path) {
    files.par_iter_mut().for_each(
      |image| match Self::create_thumbnail(image, thumbnail_target) {
        Ok(image_metadata) => image.update_image_metadata(image_metadata),
        Err(err) => image.mark_image_metadata_error(err),
      },
    );
  }

  fn create_thumbnail(image: &Image, thumbnail_target: &Path) -> Result<ImageMetadata, String> {
    panic::catch_unwind(|| ThumbnailP::create_image_metadata(&image.path, thumbnail_target))
      .map_err(|_| {
        tracing::error!(path=%image.path, id=image.id, "Hash panicked");
        "hash_image panicked".to_string()
      })?
      .map_err(|e| {
        tracing::error!(path=%image.path, id=image.id, error=%e);
        e.to_string()
      })
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::infrastructure::models::image_model::ImageStatus;
  use std::fs::File;
  use std::io::Write;
  use tempfile::tempdir;

  #[test]
  fn test_process_batch_empty() {
    let dir = tempdir().unwrap();
    let mut images: Vec<Image> = vec![];
    ThumbnailService::process_batch(&mut images, dir.path());
    assert!(images.is_empty());
  }

  #[test]
  fn test_process_batch_with_nonexistent_file() {
    let dir = tempdir().unwrap();
    let mut images = vec![Image {
      id: 1,
      path: "/nonexistent/path/to/file.jpg".to_string(),
      size_bytes: 100,
      status: ImageStatus::Hashed,
      ..Default::default()
    }];

    ThumbnailService::process_batch(&mut images, dir.path());

    assert_eq!(images[0].status, ImageStatus::Hashed);
    assert!(images[0].error_message.is_some());
    assert_eq!(images[0].retry_count, 1);
  }

  #[test]
  fn test_process_batch_preserves_existing_retry_count() {
    let dir = tempdir().unwrap();
    let mut images = vec![Image {
      id: 1,
      path: "/nonexistent/file.jpg".to_string(),
      size_bytes: 100,
      status: ImageStatus::Hashed,
      retry_count: 2,
      ..Default::default()
    }];

    ThumbnailService::process_batch(&mut images, dir.path());

    assert_eq!(images[0].retry_count, 3);
  }

  #[test]
  fn test_process_batch_clears_error_on_success() {
    let dir = tempdir().unwrap();

    // Create a simple test image file (1x1 pixel PNG)
    let file_path = dir.path().join("test.png");
    let png_data = vec![
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, // bit depth, color type, CRC
      0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
      0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, // compressed data
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, // CRC
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND chunk
      0x42, 0x60, 0x82
    ];
    let mut file = File::create(&file_path).unwrap();
    file.write_all(&png_data).unwrap();
    drop(file);

    let thumbnail_dir = dir.path().join("thumbnails");
    std::fs::create_dir(&thumbnail_dir).unwrap();

    let mut images = vec![Image {
      id: 1,
      path: file_path.to_str().unwrap().to_string(),
      size_bytes: png_data.len() as i64,
      status: ImageStatus::Hashed,
      retry_count: 2,
      error_message: Some("previous error".to_string()),
      ..Default::default()
    }];

    ThumbnailService::process_batch(&mut images, &thumbnail_dir);

    assert_eq!(images[0].status, ImageStatus::Thumbnailed);
    assert_eq!(images[0].retry_count, 0);
    assert_eq!(images[0].error_message, None);
    assert!(!images[0].thumbnail_path.is_empty());
    assert!(images[0].width > 0);
    assert!(images[0].height > 0);
  }

  #[test]
  fn test_process_batch_multiple_images_mixed() {
    let dir = tempdir().unwrap();

    // Create a valid PNG
    let file_path = dir.path().join("valid.png");
    let png_data = vec![
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
      0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
      0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
      0x42, 0x60, 0x82
    ];
    let mut file = File::create(&file_path).unwrap();
    file.write_all(&png_data).unwrap();
    drop(file);

    let thumbnail_dir = dir.path().join("thumbnails");
    std::fs::create_dir(&thumbnail_dir).unwrap();

    let mut images = vec![
      Image {
        id: 1,
        path: file_path.to_str().unwrap().to_string(),
        size_bytes: png_data.len() as i64,
        status: ImageStatus::Hashed,
        ..Default::default()
      },
      Image {
        id: 2,
        path: "/nonexistent/invalid.jpg".to_string(),
        size_bytes: 100,
        status: ImageStatus::Hashed,
        ..Default::default()
      },
    ];

    ThumbnailService::process_batch(&mut images, &thumbnail_dir);

    // First image should succeed
    assert_eq!(images[0].status, ImageStatus::Thumbnailed);
    assert!(!images[0].thumbnail_path.is_empty());

    // Second image should fail
    assert_eq!(images[1].status, ImageStatus::Hashed);
    assert!(images[1].error_message.is_some());
  }
}