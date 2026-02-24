use crate::{
  application::{pipeline::stage::PipelineStage, service::thumbnail_service},
  domain::image::{Image, ImageMetadata},
  infrastructure::{
    models::image_model::ImageStatus,
    repo::{error::DatabaseError, image_repo::ImageRepository},
  },
};

use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::mpsc;

#[derive(Clone)]
pub struct ThumbnailStage {
  thumbnail_target: PathBuf,
  next_stage_tx: mpsc::Sender<Image>,
  repo: Arc<ImageRepository>,
}

impl ThumbnailStage {
  pub fn new(
    thumbnail_target: PathBuf,
    next_stage_tx: mpsc::Sender<Image>,
    repo: Arc<ImageRepository>,
  ) -> Self {
    Self {
      thumbnail_target,
      next_stage_tx,
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

  /// Step 1: Check if we have a duplicate image
  /// Save new image with same thumbnail path
  async fn filter_batch(&self, items: Vec<Image>) -> Vec<Image> {
    let mut duplicate_images = Vec::with_capacity(items.len());
    let mut hashed_images = Vec::with_capacity(items.len());

    for mut image in items {
      if image.status != ImageStatus::Hashed {
        if let Err(e) = self.next_stage_tx.send(image).await {
          tracing::error!(error = ?e, "Failed to route image to thumbnail stage");
        }
        continue;
      }

      if let Ok(duplicate_image) = self
        .repo
        .find_image_by_hash_and_status(&image.content_hash, ImageStatus::Thumbnailed)
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
      } else {
        hashed_images.push(image);
      }
    }

    let _ = self
      .repo
      .update_image_metadata(&duplicate_images)
      .await
      .map_err(|err| tracing::error!(err= ?err, "Failed to update images"));

    hashed_images
  }

  /// Step 2: CPU-Bound Processing (Synchronous)
  fn process_batch(&self, mut images: Vec<Image>) -> Vec<Image> {
    let target_dir = &self.thumbnail_target;
    thumbnail_service::process_batch(&mut images, target_dir);
    images
  }

  /// Step 1: DB Updates & Routing (Asynchronous)
  async fn handle_completed_batch(&self, items: Vec<Image>) -> Result<u64, DatabaseError> {
    let updated_count = self.repo.update_image_metadata(&items).await?;
    tracing::info!(
      count = updated_count,
      "Successfully generated thumbnails and updated database."
    );
    Ok(updated_count)
  }
}
