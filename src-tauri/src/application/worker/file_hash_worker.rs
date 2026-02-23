use std::sync::Arc;

use crate::{
  application::{service::file_hash_service, worker::Worker},
  domain::image::Image,
  infrastructure::{
    models::image_model::ImageStatus,
    repo::{error::DatabaseError, image_repo::ImageRepository},
  },
  setup::settings::{FILE_HASH_BATCH_FACTOR, MAX_WORKER_RETRIES},
};

#[derive(Debug, Clone)]
pub struct FileHashWorker {
  repo: Arc<ImageRepository>,
}

impl FileHashWorker {
  pub fn new(repo: Arc<ImageRepository>) -> Self {
    Self { repo }
  }
}

impl Worker for FileHashWorker {
  type Input = Image;
  type Output = Image;
  type Error = DatabaseError;

  fn name(&self) -> &'static str {
    "file_hash_worker"
  }

  fn batch_factor(&self) -> usize {
    FILE_HASH_BATCH_FACTOR
  }

  async fn fetch_batch(&self, limit: i64) -> Result<Vec<Image>, DatabaseError> {
    let models = self
      .repo
      .get_images_for_processing(limit, MAX_WORKER_RETRIES, ImageStatus::Pending)
      .await?;
    Ok(models.into_iter().map(Image::from).collect())
  }

  fn process_batch(&self, mut items: Vec<Image>) -> Vec<Image> {
    file_hash_service::process_batch(&mut items);
    items
  }

  async fn update_batch(&self, items: &[Image]) -> Result<u64, DatabaseError> {
    let count = self.repo.update_images_content_hash(items).await?;
    Ok(count)
  }
}
