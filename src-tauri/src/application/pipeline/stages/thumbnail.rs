use std::{
  collections::{HashMap, HashSet},
  path::PathBuf,
  sync::Arc,
};

use crate::{
  application::{pipeline::stage::PipelineStage, service::thumbnail_service},
  domain::image::{Image, ImageMetadata},
  infrastructure::{
    models::image_model::{ImageRow, ImageStatus},
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
  type RawItem = ImageRow;
  type Item = Image;
  type Error = DatabaseError;

  fn name(&self) -> &'static str {
    "thumbnail_stage"
  }

  async fn fetch_batch(&self, batch_size: usize) -> Result<Vec<ImageRow>, DatabaseError> {
    self
      .repo
      .get_images_for_processing(batch_size as i64, MAX_PIPELINE_RETRIES, ImageStatus::Hashed)
      .await
  }

  async fn filter_batch(&self, rows: Vec<ImageRow>) -> Result<Vec<Self::Item>, Self::Error> {
    let images: Vec<Image> = rows.into_iter().map(Into::into).collect();

    let unique_hashes: HashSet<Vec<u8>> =
      images.iter().map(|img| img.content_hash.clone()).collect();

    let existing_rows = self
      .repo
      .get_images_by_hashes_and_status(&unique_hashes, ImageStatus::Thumbnailed)
      .await?;

    let existing: HashMap<Vec<u8>, ImageRow> = existing_rows
      .into_iter()
      .filter_map(|row| row.content_hash.clone().map(|hash| (hash, row)))
      .collect();

    let mut duplicates: Vec<Image> = Vec::with_capacity(images.len());
    let mut to_process: Vec<Image> = Vec::with_capacity(images.len());
    let mut seen_in_batch: HashSet<Vec<u8>> = HashSet::new();

    for mut image in images {
      if let Some(existing) = existing.get(&image.content_hash) {
        tracing::info!(
          id = image.id,
          "Duplicate content found, linking existing thumbnail."
        );
        image.update_image_metadata(ImageMetadata {
          thumbnail_path: existing.thumbnail_path.clone().unwrap(),
          width: existing.width.unwrap_or(1),
          height: existing.height.unwrap_or(1),
        });
        duplicates.push(image);
        continue;
      }

      if !seen_in_batch.insert(image.content_hash.clone()) {
        tracing::debug!(id = image.id, "Intra-batch duplicate, deferring.");
        continue;
      }

      to_process.push(image);
    }

    if !duplicates.is_empty() {
      if let Err(err) = self.repo.update_image_metadata(&duplicates).await {
        tracing::error!(?err, "Failed to commit metadata for duplicate images.");
      }
    }

    Ok(to_process)
  }

  fn process_batch(&self, mut images: Vec<Image>) -> Vec<Image> {
    thumbnail_service::process_batch(&mut images, &self.thumbnail_target);
    images
  }

  async fn commit_batch(&self, items: Vec<Image>) -> Result<u64, DatabaseError> {
    self.repo.update_image_metadata(&items).await
  }
}
