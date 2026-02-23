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

  async fn filter_batch(&self, items: Vec<Image>) -> Vec<Image> {
    let mut duplicate_images = Vec::new();
    let mut hashed_images = Vec::new();

    for mut image in items {
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
