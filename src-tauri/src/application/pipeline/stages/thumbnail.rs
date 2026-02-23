use crate::{
  application::{pipeline::stage::PipelineStage, service::thumbnail_service},
  domain::image::Image,
  infrastructure::repo::{error::DatabaseError, image_repo::ImageRepository},
};

use std::path::PathBuf;
use std::sync::Arc;

#[derive(Clone)]
pub struct ThumbnailStage {
  pub thumbnail_target: PathBuf,
  repo: Arc<ImageRepository>,
}

impl ThumbnailStage {
  pub fn new(thumbnail_target: PathBuf, repo: Arc<ImageRepository>) -> Self {
    Self {
      thumbnail_target,
      repo,
    }
  }
}

impl PipelineStage for ThumbnailStage {
  type Input = Image;
  type Output = Image;
  type Error = DatabaseError;

  fn name(&self) -> &'static str {
    "thumbnail_stage"
  }

  /// Step 1: CPU-Bound Processing (Synchronous)
  fn process_batch(&self, mut images: Vec<Image>) -> Vec<Image> {
    let target_dir = &self.thumbnail_target;
    thumbnail_service::process_batch(&mut images, target_dir);
    images
  }

  /// Step 2: DB Updates & Routing (Asynchronous)
  async fn handle_completed_batch(&self, items: Vec<Image>) -> Result<u64, DatabaseError> {
    let updated_count = self.repo.update_image_metadata(&items).await?;
    tracing::info!(
      count = updated_count,
      "Successfully generated thumbnails and updated database."
    );
    Ok(updated_count)
  }
}
