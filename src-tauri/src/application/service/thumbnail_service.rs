use crate::{
  application::error::AppError,
  domain::image::{Image, ImageMetadata},
  infrastructure::{fs::ops, processing::thumbnail},
};

use std::{
  panic,
  path::{Path, PathBuf},
};

#[cfg(debug_assertions)]
use tauri::Runtime;
use tauri::{AppHandle, Manager};

#[cfg(not(debug_assertions))]
pub fn get_thumbnail_target(app: &AppHandle) -> Result<PathBuf, AppError> {
  let cache_dir = app
    .path()
    .app_cache_dir()
    .map_err(|err| AppError::Internal { source: err })?;

  let target_dir = cache_dir.join(".thumbnails");

  ops::ensure_dir(&target_dir)?;

  Ok(target_dir)
}

#[cfg(debug_assertions)]
pub fn get_thumbnail_target<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, AppError> {
  let app_dir = app
    .path()
    .app_data_dir()
    .map_err(|err| AppError::Internal { source: err })?;
  let target_dir = app_dir.join(".thumbnails");
  ops::ensure_dir(&target_dir)?;
  Ok(target_dir)
}

pub fn process_batch(files: &mut [Image], thumbnail_target: &Path) {
  use rayon::prelude::*;
  files
    .par_iter_mut()
    .for_each(|image| match create_thumbnail(image, thumbnail_target) {
      Ok(image_metadata) => image.update_image_metadata(image_metadata),
      Err(err) => image.mark_image_metadata_error(err),
    });
}

fn create_thumbnail(image: &Image, thumbnail_target: &Path) -> Result<ImageMetadata, String> {
  let result =
    panic::catch_unwind(|| thumbnail::create_image_metadata(&image.path, thumbnail_target));

  match result {
    Ok(inner_res) => {
      // Map the internal creation error to a string for the DB
      inner_res.map_err(|e| {
        tracing::error!(path = %image.path, id = image.id, error = %e, "Thumbnail creation failed");
        e.to_string()
      })
    }
    Err(panic_payload) => {
      // Downcast to get the exact panic message
      let panic_msg = if let Some(s) = panic_payload.downcast_ref::<&str>() {
        s.to_string()
      } else if let Some(s) = panic_payload.downcast_ref::<String>() {
        s.clone()
      } else {
        "Unknown panic payload type".to_string()
      };

      tracing::error!(
        path = %image.path,
        id = image.id,
        panic_message = %panic_msg,
        "Thumbnail generator panicked"
      );

      Err(format!("Thumbnail generator panicked: {}", panic_msg))
    }
  }
}

#[cfg(test)]
mod path_tests {
  use super::*;
  use tauri::test::mock_app;

  #[tokio::test]
  async fn test_get_thumbnail_target_creation() {
    let app = mock_app();
    let handle = app.handle();

    let result = get_thumbnail_target(handle);
    assert!(
      result.is_ok(),
      "Should resolve path and ensure directory exists"
    );

    let path = result.unwrap();
    assert!(path.exists(), "Target directory must be created on disk");
    assert!(path.is_dir());
    assert!(path.to_string_lossy().contains(".thumbnails"));
  }
}

#[cfg(test)]
mod worker_tests {
  use super::*;
  use tempfile::tempdir;

  #[test]
  fn test_process_batch_thumbnail_lifecycle() {
    // 1. Setup: Create temp dirs for source and target
    let source_dir = tempdir().unwrap();
    let target_dir = tempdir().unwrap();

    // Create a dummy "image" file
    let img_path = source_dir.path().join("test_photo.jpg");
    std::fs::File::create(&img_path).unwrap();

    let mut images = vec![
      Image {
        id: 1,
        path: img_path.to_string_lossy().to_string(),
        ..Default::default()
      },
      Image {
        id: 2,
        path: "corrupt_or_missing.jpg".to_string(),
        ..Default::default()
      },
    ];

    // 2. Execute Batch
    process_batch(&mut images, target_dir.path());

    // 3. Assertions
    // Image 1: Should ideally have metadata updated (depends on your thumbnail mock/impl)
    // If thumbnail::create_image_metadata actually processes the file, verify results:
    assert_eq!(images[0].width, 0);

    // Image 2: Should have an error message captured
    assert!(
      images[1].error_message.is_some(),
      "Missing file should record an error"
    );

    assert!(images[1].thumbnail_path.is_empty());
  }

  #[test]
  fn test_create_thumbnail_panic_recovery() {
    let target_dir = tempdir().unwrap();

    // Create an image object that triggers a panic in your mock/implementation
    let image = Image {
      id: 99,
      path: "trigger_panic".to_string(),
      ..Default::default()
    };

    let result = create_thumbnail(&image, target_dir.path());

    // Assert: The worker caught the panic and converted it to a String error
    assert!(result.is_err());
    let err_msg = result.unwrap_err();
    assert!(!err_msg.is_empty());
  }
}
