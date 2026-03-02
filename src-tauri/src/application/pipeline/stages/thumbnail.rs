use std::{collections::HashSet, path::PathBuf, sync::Arc};

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
    let mut seen_hashes_in_batch = HashSet::with_capacity(batch_size);
    let mut images_to_process = Vec::with_capacity(batch_size);

    loop {
      let rows: Vec<crate::infrastructure::models::image_model::ImageRow> = self
        .repo
        .get_images_for_processing(batch_size as i64, MAX_PIPELINE_RETRIES, ImageStatus::Hashed)
        .await?;

      if rows.is_empty() {
        break;
      }

      let mut duplicate_images = Vec::with_capacity(batch_size);

      for row in rows {
        let mut image: Image = row.into();

        if let Ok(Some(duplicate_image)) = self
          .repo
          .find_image_by_hash_and_status(&image.content_hash, ImageStatus::Thumbnailed)
          .await
        {
          tracing::info!(
            "Duplicate content found for {}. Linking existing thumbnail.",
            image.id
          );

          image.update_image_metadata(ImageMetadata {
            thumbnail_path: duplicate_image.thumbnail_path.unwrap_or_default(),
            width: duplicate_image.width.unwrap_or(1),
            height: duplicate_image.height.unwrap_or(1),
          });

          duplicate_images.push(image);
          continue;
        }

        if seen_hashes_in_batch.contains(&image.content_hash) {
          tracing::info!(
            "Intra-batch duplicate deferred for {}. Will process in next loop.",
            image.id
          );
          continue;
        }

        seen_hashes_in_batch.insert(image.content_hash.clone());
        images_to_process.push(image);
      }

      if !duplicate_images.is_empty() {
        if let Err(err) = self.repo.update_image_metadata(&duplicate_images).await {
          tracing::error!(?err, "Failed to update metadata for duplicate images");
        }
      }

      tracing::info!("Found duplicates, fetching next batch...");
    }

    Ok(images_to_process)
  }

  fn process_batch(&self, mut images: Vec<Image>) -> Vec<Image> {
    thumbnail_service::process_batch(&mut images, &self.thumbnail_target);
    images
  }

  async fn commit_batch(&self, items: Vec<Image>) -> Result<u64, DatabaseError> {
    self.repo.update_image_metadata(&items).await
  }
}
