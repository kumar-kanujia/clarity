use crate::{
  application::{service::thumbnail_service, worker::Worker},
  domain::image::Image,
  infrastructure::{
    models::image_model::ImageStatus,
    repo::{error::DatabaseError, image_repo::ImageRepository},
  },
  setup::settings::MAX_WORKER_RETRIES,
};

use std::{path::PathBuf, sync::Arc};

use tauri::AppHandle;

#[derive(Debug, Clone)]
pub struct ThumbnailWorker {
  pub thumbnail_target: PathBuf,
  repo: Arc<ImageRepository>,
}

impl ThumbnailWorker {
  pub fn new(app: &AppHandle, repo: Arc<ImageRepository>) -> Option<Self> {
    match thumbnail_service::get_thumbnail_target(app) {
      Ok(path) => Some(Self {
        thumbnail_target: path,
        repo: repo,
      }),
      Err(e) => {
        tracing::error!(error = ?e, "Thumbnail worker failed to lock cache directory");
        None
      }
    }
  }
}

impl Worker for ThumbnailWorker {
  type Input = Image;
  type Output = Image;
  type Error = DatabaseError;

  fn name(&self) -> &'static str {
    "thumbnail_worker"
  }

  fn batch_factor(&self) -> usize {
    2
  }

  async fn fetch_batch(&self, limit: i64) -> Result<Vec<Image>, DatabaseError> {
    let raw_images = self
      .repo
      .get_images_for_processing(limit, MAX_WORKER_RETRIES, ImageStatus::Hashed)
      .await?;
    let images = raw_images.into_iter().map(Image::from).collect();
    Ok(images)
  }

  fn process_batch(&self, mut images: Vec<Image>) -> Vec<Image> {
    thumbnail_service::process_batch(&mut images, &self.thumbnail_target);
    images
  }

  async fn update_batch(&self, images: &[Image]) -> Result<u64, DatabaseError> {
    let count = self.repo.update_image_metadata(images).await?;
    Ok(count)
  }
}
