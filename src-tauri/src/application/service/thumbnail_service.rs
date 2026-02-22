use crate::{
  application::error::AppError,
  domain::image::{Image, ImageMetadata},
  infrastructure::{fs::ops, processing::thumbnail},
};

use std::{
  panic,
  path::{Path, PathBuf},
};

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
pub fn get_thumbnail_target(app: &AppHandle) -> Result<PathBuf, AppError> {
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
