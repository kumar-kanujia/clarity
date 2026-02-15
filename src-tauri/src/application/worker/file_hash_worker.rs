use crate::{
  application::{service::file_hash_service::FileHashService, worker::Worker},
  domain::image::Image,
  infrastructure::{
    models::image_model::ImageStatus,
    repo::{error::DatabaseError, image_repo::ImageRepository},
  },
};

#[derive(Debug, Clone)]
pub struct FileHashWorker {
  repo: &'static ImageRepository,
}

impl FileHashWorker {
  pub fn new(repo: &'static ImageRepository) -> Self {
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
    4
  }

  async fn fetch_batch(&self, limit: i64) -> Result<Vec<Image>, DatabaseError> {
    let models = self
      .repo
      .list_images_by_status(limit, ImageStatus::Pending)
      .await?;
    Ok(models.into_iter().map(Image::from).collect())
  }

  fn process_batch(&self, mut items: Vec<Image>) -> Vec<Image> {
    FileHashService::process_batch(&mut items);
    items
  }

  async fn update_batch(&self, items: &[Image]) -> Result<u64, DatabaseError> {
    let count = self.repo.update_images_hash(items).await?;
    Ok(count)
  }
}
