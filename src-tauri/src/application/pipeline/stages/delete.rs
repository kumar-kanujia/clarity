use crate::{
  application::pipeline::stage::PipelineStage,
  domain::image::Image,
  infrastructure::{
    fs::ops,
    models::image_model::ImageStatus,
    repo::{error::DatabaseError, image_repo::ImageRepository},
  },
};

use rayon::iter::{IntoParallelIterator, ParallelIterator};
use std::sync::Arc;

#[derive(Clone)]
pub struct DeleteStage {
  repo: Arc<ImageRepository>,
}

impl DeleteStage {
  pub fn new(repo: Arc<ImageRepository>) -> Self {
    Self { repo }
  }
}

impl PipelineStage for DeleteStage {
  type Input = Image;
  type Output = i64;
  type Error = DatabaseError;

  fn name(&self) -> &'static str {
    "delete_stage"
  }

  /// Step 1: Check if we have a duplicate image
  /// and are not marked for deletion
  async fn filter_batch(&self, items: Vec<Image>) -> Vec<Image> {
    let mut filtered_images = Vec::with_capacity(items.len());
    for mut image in items {
      if image.status != ImageStatus::Deleted {
        continue;
      }

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
        image.thumbnail_path = String::new();
      }
      filtered_images.push(image);
    }
    filtered_images
  }

  /// Step 2: CPU-Bound Processing (Synchronous)
  fn process_batch(&self, images: Vec<Image>) -> Vec<i64> {
    images
      .into_par_iter()
      .map(|image| {
        if let Err(e) = ops::delete_file(image.path) {
          tracing::error!(error = ?e, "Failed to delete file");
        }
        if !image.thumbnail_path.is_empty()
          && let Err(e) = ops::delete_file(image.thumbnail_path)
        {
          tracing::error!(error = ?e, "Failed to delete file");
        }
        image.id
      })
      .collect()
  }

  /// Step 1: DB Updates & Routing (Asynchronous)
  async fn handle_completed_batch(&self, items: Vec<i64>) -> Result<u64, DatabaseError> {
    let updated_count = self.repo.delete_images(&items).await?;
    tracing::info!(
      count = updated_count,
      "Successfully deleted files and updated database."
    );
    Ok(updated_count)
  }
}
