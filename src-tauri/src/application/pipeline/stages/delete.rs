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
    if rows.is_empty() {
      return Ok(vec![]);
    }

    let mut batch = Vec::with_capacity(rows.len());

    let mut thumbnails_scheduled_for_deletion = HashSet::new();

    for row in rows {
      let image: Image = row.into();

      let has_active_sibling = matches!(
        self
          .repo
          .find_image_by_hash_and_status(&image.content_hash, ImageStatus::Thumbnailed)
          .await,
        Ok(Some(_))
      );

      let should_delete_thumb = if has_active_sibling {
        false
      } else {
        thumbnails_scheduled_for_deletion.insert(image.content_hash.clone())
      };

      let thumbnail_path = if should_delete_thumb && !image.thumbnail_path.is_empty() {
        Some(image.thumbnail_path)
      } else {
        None
      };

      batch.push(DeletionTarget {
        id: image.id,
        path: image.path,
        thumbnail_path,
      });
    }

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
    let deleted = self.repo.delete_images(&ids).await?;
    Ok(deleted)
  }
}
