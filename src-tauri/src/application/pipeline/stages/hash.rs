use crate::{
  application::{pipeline::stage::PipelineStage, service::file_hash_service},
  domain::image::Image,
  infrastructure::{
    models::image_model::ImageStatus,
    repo::{error::DatabaseError, image_repo::ImageRepository},
  },
};

use std::sync::Arc;
use tokio::sync::mpsc;

#[derive(Clone)]
pub struct HashStage {
  repo: Arc<ImageRepository>,
  next_stage_tx: mpsc::Sender<Image>,
}

impl HashStage {
  pub fn new(repo: Arc<ImageRepository>, next_stage_tx: mpsc::Sender<Image>) -> Self {
    Self {
      repo,
      next_stage_tx,
    }
  }
}

impl PipelineStage for HashStage {
  type Input = Image;
  type Output = Image;
  type Error = DatabaseError;

  fn name(&self) -> &'static str {
    "hash_stage"
  }

  async fn filter_batch(&self, items: Vec<Image>) -> Vec<Image> {
    let mut filtered_images = Vec::with_capacity(items.len());
    for image in items {
      if image.status == ImageStatus::Pending {
        filtered_images.push(image);
      } else {
        if let Err(e) = self.next_stage_tx.send(image).await {
          tracing::error!(error = ?e, "Failed to route image to thumbnail stage");
        }
      }
    }
    filtered_images
  }

  fn process_batch(&self, mut items: Vec<Image>) -> Vec<Image> {
    file_hash_service::process_batch(&mut items);
    items
  }

  async fn handle_completed_batch(&self, items: Vec<Image>) -> Result<u64, DatabaseError> {
    let mut processed_count = 0;

    self.repo.update_images_content_hash(&items).await?;

    for image in items {
      if image.status == ImageStatus::Hashed {
        processed_count += 1;
        if let Err(e) = self.next_stage_tx.send(image).await {
          processed_count -= 1;
          tracing::error!(error = ?e, "Failed to route image to thumbnail stage");
        }
      }
    }

    Ok(processed_count)
  }
}
