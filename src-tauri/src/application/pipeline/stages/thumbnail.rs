use std::{path::PathBuf, sync::Arc};

use crate::{
  application::{pipeline::stage::PipelineStage, service::thumbnail_service},
  domain::image::{Image, ImageMetadata},
  infrastructure::{
    models::image_model::ImageStatus,
    repo::{error::DatabaseError, image_repo::ImageRepository},
  },
  setup::settings::MAX_PIPELINE_RETRIES,
};

pub struct ThumbnailStage {
  repo: Arc<ImageRepository>,
  thumbnail_target: PathBuf,
}

impl ThumbnailStage {
  pub fn new(repo: Arc<ImageRepository>, thumbnail_target: PathBuf) -> Self {
    Self {
      repo,
      thumbnail_target,
    }
  }
}

impl PipelineStage for ThumbnailStage {
  type Item = Image;
  type Error = DatabaseError;

  fn name(&self) -> &'static str {
    "thumbnail_stage"
  }

  async fn fetch_batch(&self, batch_size: usize) -> Result<Vec<Image>, DatabaseError> {
    let models = self
      .repo
      .get_images_for_processing(batch_size as i64, MAX_PIPELINE_RETRIES, ImageStatus::Hashed)
      .await?;

    if models.is_empty() {
      return Ok(vec![]);
    }

    let images: Vec<Image> = models.into_iter().map(Into::into).collect();

    let mut duplicate_images = Vec::with_capacity(images.len());
    let mut hashed_images = Vec::with_capacity(images.len());

    for mut image in images {
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

    Ok(hashed_images)
  }

  fn process_batch(&self, mut images: Vec<Image>) -> Vec<Image> {
    thumbnail_service::process_batch(&mut images, &self.thumbnail_target);
    images
  }

  async fn commit_batch(&self, items: Vec<Image>) -> Result<u64, DatabaseError> {
    let updated = self.repo.update_image_metadata(&items).await?;
    Ok(updated)
  }
}
