use crate::{
  application::error::AppError,
  domain::image::{Image, ImageMetadata},
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
    let cache_dir = app
      .path()
      .app_data_dir()
      .map_err(|err| AppError::Internal { source: err })?;
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
