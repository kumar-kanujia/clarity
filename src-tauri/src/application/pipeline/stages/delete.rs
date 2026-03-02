use std::sync::Arc;

use rayon::iter::{IntoParallelIterator, ParallelIterator};

use crate::{
  application::pipeline::stage::PipelineStage,
  domain::image::Image,
  infrastructure::{
    fs::ops,
    models::image_model::ImageStatus,
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
  type Item = DeletionTarget;
  type Error = DatabaseError;

  fn name(&self) -> &'static str {
    "delete_stage"
  }

  async fn fetch_batch(&self, batch_size: usize) -> Result<Vec<DeletionTarget>, DatabaseError> {
    let models = self
      .repo
      .get_images_for_processing(
        batch_size as i64,
        MAX_PIPELINE_RETRIES,
        ImageStatus::Deleted,
      )
      .await?;

    if models.is_empty() {
      return Ok(vec![]);
    }

    let images: Vec<Image> = models.into_iter().map(Into::into).collect();

    let mut batch = Vec::with_capacity(images.len());

    for image in images {
      if let Ok(duplicate_image) = self
        .repo
        .find_image_by_hash_and_status(&image.content_hash, ImageStatus::Thumbnailed)
        .await
        && let Some(_) = duplicate_image
      {
        tracing::info!(
          "Duplicate content found for {}. Unlinking existing thumbnail.",
          image.id
        );
        batch.push(DeletionTarget {
          id: image.id,
          path: image.path.clone(),
          thumbnail_path: None,
        });
        continue;
      }
      batch.push(DeletionTarget {
        id: image.id,
        path: image.path.clone(),
        thumbnail_path: Some(image.thumbnail_path),
      });
    }

    Ok(batch)
  }

  fn process_batch(&self, targets: Vec<DeletionTarget>) -> Vec<DeletionTarget> {
    targets
      .into_par_iter()
      .filter_map(|target| {
        if let Err(e) = ops::delete_file(&target.path) {
          tracing::error!(error = ?e, path = %target.path, "Failed to delete image file");
          return None; // Don't mark as deleted in DB if file removal failed.
        }

        if let Some(ref thumb) = target.thumbnail_path {
          if !thumb.is_empty() {
            if let Err(e) = ops::delete_file(thumb) {
              tracing::warn!(error = ?e, path = %thumb, "Failed to delete thumbnail");
            }
          }
        }

        Some(target)
      })
      .collect()
  }

  async fn commit_batch(&self, items: Vec<DeletionTarget>) -> Result<u64, DatabaseError> {
    let ids: Vec<i64> = items.into_iter().map(|t| t.id).collect();
    let deleted = self.repo.delete_images(&ids).await?;
    Ok(deleted)
  }
}
