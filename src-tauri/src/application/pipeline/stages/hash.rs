use crate::{
  application::{pipeline::stage::PipelineStage, service::file_hash_service},
  domain::image::{Image, ImageMetadata},
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

  /// Step 1: CPU-Bound Processing (Synchronous)
  fn process_batch(&self, mut items: Vec<Image>) -> Vec<Image> {
    file_hash_service::process_batch(&mut items);
    items
  }

  /// Step 2: DB Updates & Routing (Asynchronous)
  async fn handle_completed_batch(&self, items: Vec<Image>) -> Result<u64, DatabaseError> {
    let mut processed_count = 0;

    let mut hashed_images: Vec<Image> = Vec::new();
    let mut duplicate_images: Vec<Image> = Vec::new();

    for mut image in items {
      if image.status == ImageStatus::Hashed {
        if let Ok(duplicate_image) = self
          .repo
          .find_image_by_hash_and_status(&image.content_hash, ImageStatus::Hashed)
          .await
          && let Some(duplicate_image) = duplicate_image
        {
          tracing::info!(
            "Duplicate content found for {}. Linking existing thumbnail.",
            image.id
          );
          image.update_image_metadata(ImageMetadata {
            thumbnail_path: duplicate_image.thumbnail_path.unwrap(),
            width: duplicate_image.width.unwrap(),
            height: duplicate_image.height.unwrap(),
          });
          duplicate_images.push(image);
        }
      } else {
        tracing::info!(
          "New unique image {}. Saving hash and routing to thumbnail stage.",
          image.id
        );
        hashed_images.push(image);
      }

      processed_count += 1;
    }

    self.repo.update_image_metadata(&duplicate_images).await?;
    self.repo.update_images_content_hash(&hashed_images).await?;

    for image in hashed_images {
      if let Err(e) = self.next_stage_tx.send(image).await {
        tracing::error!(error = ?e, "Failed to route image to thumbnail stage");
      }
    }

    Ok(processed_count)
  }
}
