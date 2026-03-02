use std::sync::Arc;

use crate::{
  application::{
    pipeline::{orchestrator::PipelineHandle, signal::PipelineSignal, stage::PipelineStage},
    service::file_hash_service,
  },
  domain::image::Image,
  infrastructure::{
    models::image_model::{ImageRow, ImageStatus},
    repo::{error::DatabaseError, image_repo::ImageRepository},
  },
  setup::settings::MAX_PIPELINE_RETRIES,
};

pub struct HashStage {
  repo: Arc<ImageRepository>,
  handle: PipelineHandle,
}

impl HashStage {
  pub fn new(repo: Arc<ImageRepository>, handle: PipelineHandle) -> Self {
    Self { repo, handle }
  }
}

impl PipelineStage for HashStage {
  type RawItem = ImageRow;
  type Item = Image;
  type Error = DatabaseError;

  fn name(&self) -> &'static str {
    "hash_stage"
  }

  async fn fetch_batch(&self, batch_size: usize) -> Result<Vec<ImageRow>, DatabaseError> {
    self
      .repo
      .get_images_for_processing(
        batch_size as i64,
        MAX_PIPELINE_RETRIES,
        ImageStatus::Pending,
      )
      .await
  }

  async fn filter_batch(&self, rows: Vec<ImageRow>) -> Result<Vec<Self::Item>, Self::Error> {
    Ok(rows.into_iter().map(Into::into).collect())
  }

  fn process_batch(&self, mut items: Vec<Image>) -> Vec<Image> {
    file_hash_service::process_batch(&mut items);
    items
  }

  async fn commit_batch(&self, items: Vec<Image>) -> Result<u64, DatabaseError> {
    let count = self.repo.update_images_content_hash(&items).await?;
    if count > 0 {
      self.handle.emit(PipelineSignal::ImageHashed).await;
    }
    Ok(count)
  }
}
