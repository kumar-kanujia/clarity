use crate::{
  application::{services::thumbnail_service::ThumbnailService, workers::Worker},
  domain::image::Image,
  infrastructure::{
    models::image_model::ImageStatus,
    repo::{error::DatabaseError, image_repo::ImageRepository},
  },
};

use std::path::PathBuf;

use tauri::AppHandle;

#[derive(Debug, Clone)]
pub struct ThumbnailWorker {
  pub thumbnail_target: PathBuf,
  repo: &'static ImageRepository,
}

impl ThumbnailWorker {
  pub fn new(app: &AppHandle, repo: &'static ImageRepository) -> Option<Self> {
    match ThumbnailService::get_thumbnail_target(app) {
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
    let models = self
      .repo
      .list_images_by_status(limit, ImageStatus::Hashed)
      .await?;
    Ok(models.into_iter().map(Image::from).collect())
  }

  fn process_batch(&self, mut items: Vec<Image>) -> Vec<Image> {
    ThumbnailService::process_batch(&mut items, &self.thumbnail_target);
    items
  }

  async fn update_batch(&self, items: &[Image]) -> Result<u64, DatabaseError> {
    let count = self.repo.update_images_metadata(items).await?;
    Ok(count)
  }
}
