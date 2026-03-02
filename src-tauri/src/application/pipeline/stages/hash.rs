use std::sync::Arc;

use crate::{
  application::{pipeline::stage::PipelineStage, service::file_hash_service},
  domain::image::Image,
  infrastructure::{
    models::image_model::ImageStatus,
    repo::{error::DatabaseError, image_repo::ImageRepository},
  },
  setup::settings::MAX_PIPELINE_RETRIES,
};

pub struct HashStage {
  repo: Arc<ImageRepository>,
}

impl HashStage {
  pub fn new(repo: Arc<ImageRepository>) -> Self {
    Self { repo }
  }
}

impl PipelineStage for HashStage {
  type Item = Image;
  type Error = DatabaseError;

  fn name(&self) -> &'static str {
    "hash_stage"
  }

  async fn fetch_batch(&self, batch_size: usize) -> Result<Vec<Image>, DatabaseError> {
    let models = self
      .repo
      .get_images_for_processing(
        batch_size as i64,
        MAX_PIPELINE_RETRIES,
        ImageStatus::Pending,
      )
      .await?;

    Ok(models.into_iter().map(Into::into).collect())
  }

  fn process_batch(&self, mut items: Vec<Image>) -> Vec<Image> {
    file_hash_service::process_batch(&mut items);
    items
  }

  async fn commit_batch(&self, items: Vec<Image>) -> Result<u64, DatabaseError> {
    let count = items.len() as u64;
    self.repo.update_images_content_hash(&items).await?;
    Ok(count)
  }
}
