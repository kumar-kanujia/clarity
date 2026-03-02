use std::{collections::HashSet, sync::Arc};

use rayon::iter::{IntoParallelIterator, ParallelIterator};

use crate::{
  application::pipeline::stage::PipelineStage,
  domain::image::Image,
  infrastructure::{
    fs::{error::FSError, ops},
    models::image_model::{ImageRow, ImageStatus},
    repo::{error::DatabaseError, image_repo::ImageRepository},
  },
  setup::settings::MAX_PIPELINE_RETRIES,
};

pub struct DeletionTarget {
  id: i64,
  path: String,
  thumbnail_path: Option<String>,
}

pub struct DeleteStage {
  repo: Arc<ImageRepository>,
}

impl DeleteStage {
  pub fn new(repo: Arc<ImageRepository>) -> Self {
    Self { repo }
  }
}

impl PipelineStage for DeleteStage {
  type RawItem = ImageRow;
  type Item = DeletionTarget;
  type Error = DatabaseError;

  fn name(&self) -> &'static str {
    "delete_stage"
  }

  async fn fetch_batch(&self, batch_size: usize) -> Result<Vec<ImageRow>, DatabaseError> {
    self
      .repo
      .get_images_for_processing(
        batch_size as i64,
        MAX_PIPELINE_RETRIES,
        ImageStatus::Deleted,
      )
      .await
  }

  async fn filter_batch(&self, rows: Vec<Self::RawItem>) -> Result<Vec<Self::Item>, Self::Error> {
    let images: Vec<Image> = rows.into_iter().map(Into::into).collect();

    let unique_hashes = images.iter().map(|img| img.content_hash.clone()).collect();

    let existing = self
      .repo
      .get_images_by_hashes_and_status(&unique_hashes, ImageStatus::Thumbnailed)
      .await?;

    let active_hashes: HashSet<Vec<u8>> = existing
      .into_iter()
      .filter_map(|row| row.content_hash)
      .collect();

    let mut thumbs_to_delete = HashSet::new();

    let batch: Vec<DeletionTarget> = images
      .into_iter()
      .map(|image| {
        let has_active_sibling = active_hashes.contains(&image.content_hash);

        let thumbnail_path = if !has_active_sibling
          && !image.thumbnail_path.is_empty()
          && thumbs_to_delete.insert(image.content_hash.clone())
        {
          Some(image.thumbnail_path)
        } else {
          None
        };
        DeletionTarget {
          id: image.id,
          path: image.path,
          thumbnail_path,
        }
      })
      .collect();

    Ok(batch)
  }

  fn process_batch(&self, targets: Vec<DeletionTarget>) -> Vec<DeletionTarget> {
    targets
      .into_par_iter()
      .filter_map(|target| {
        if let Err(err) = ops::delete_file(&target.path) {
          match err {
            FSError::FileNotFound(_) => tracing::warn!(path = %target.path, "File already missing from disk, proceeding with DB cleanup."),
            _ => {
              tracing::error!(error = ?err, path = %target.path, "Failed to delete image file. Skipping DB cleanup.");
              return None;
            }
          }
        }

        if let Some(ref thumb) = target.thumbnail_path {
            if let Err(e) = ops::delete_file(thumb) {
              tracing::warn!(error = ?e, path = %thumb, "Failed to delete thumbnail");
            }
        }

        Some(target)
      })
      .collect()
  }

  async fn commit_batch(&self, items: Vec<DeletionTarget>) -> Result<u64, DatabaseError> {
    let ids: Vec<i64> = items.into_iter().map(|t| t.id).collect();
    self.repo.delete_images(&ids).await
  }
}
