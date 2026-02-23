use crate::{
  application::pipeline::{
    stage::PipelineStage,
    stages::{hash::HashStage, thumbnail::ThumbnailStage},
  },
  domain::image::Image,
  infrastructure::{models::image_model::ImageStatus, repo::image_repo::ImageRepository},
  setup::settings::{FILE_HASH_BATCH_FACTOR, MAX_PIPELINE_RETRIES, THUMBNAIL_BATCH_FACTOR},
};

use rayon::ThreadPoolBuilder;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::mpsc;
use tokio_util::sync::CancellationToken;

pub struct PipelineOrchestrator {
  /// The entry point for the pipeline.
  pub ingestion_tx: mpsc::Sender<Image>,
}

impl PipelineOrchestrator {
  pub fn start(
    repo: Arc<ImageRepository>,
    thumbnail_target: PathBuf,
    shutdown_token: CancellationToken,
  ) -> Self {
    let thread_count = Self::get_num_threads();

    if let Err(err) = ThreadPoolBuilder::new()
      .num_threads(thread_count)
      .thread_name(|i| format!("rayon-worker-{}", i))
      .build_global()
    {
      tracing::error!(err = ?err, "Failed to initialize Rayon thread pool");
    } else {
      tracing::info!(
        "Rayon thread pool initialized with {} threads",
        thread_count
      );
    }

    let hash_batch_size = std::cmp::max(4, thread_count * FILE_HASH_BATCH_FACTOR);
    let thumb_batch_size = std::cmp::max(1, thread_count * THUMBNAIL_BATCH_FACTOR);

    let (hash_tx, hash_rx) = mpsc::channel::<Image>(10_000);
    let (thumb_tx, thumb_rx) = mpsc::channel::<Image>(10_000);

    let hash_stage = HashStage::new(repo.clone(), thumb_tx.clone());
    let thumb_stage = ThumbnailStage::new(thumbnail_target, repo.clone());

    tauri::async_runtime::spawn(hash_stage.run(hash_rx, hash_batch_size, shutdown_token.clone()));
    tauri::async_runtime::spawn(thumb_stage.run(
      thumb_rx,
      thumb_batch_size,
      shutdown_token.clone(),
    ));

    let repo_recovery = repo.clone();
    let hash_tx_recovery = hash_tx.clone();
    let thumb_tx_recovery = thumb_tx.clone();

    tauri::async_runtime::spawn(async move {
      tracing::info!("Starting Pipeline Recovery Sweep...");

      // Recover images that were uploaded but never hashed
      match repo_recovery
        .get_images_for_processing(-1, MAX_PIPELINE_RETRIES, ImageStatus::Pending)
        .await
      {
        Ok(pending_images) => {
          let count = pending_images.len();
          for img in pending_images {
            let _ = hash_tx_recovery.send(img.into()).await;
          }
          if count > 0 {
            tracing::info!("Recovered {} Pending images", count);
          }
        }
        Err(e) => tracing::error!(error = ?e, "Failed to recover Pending images"),
      }

      // Recover images that were hashed, but the app closed before thumbnailing
      match repo_recovery
        .get_images_for_processing(-1, MAX_PIPELINE_RETRIES, ImageStatus::Hashed)
        .await
      {
        Ok(hashed_images) => {
          let count = hashed_images.len();
          for img in hashed_images {
            let _ = thumb_tx_recovery.send(img.into()).await;
          }
          if count > 0 {
            tracing::info!("Recovered {} Hashed images", count);
          }
        }
        Err(e) => tracing::error!(error = ?e, "Failed to recover Hashed images"),
      }
    });

    Self {
      ingestion_tx: hash_tx,
    }
  }

  /// Helper to determine optimal thread count
  fn get_num_threads() -> usize {
    std::thread::available_parallelism()
      .map(|p| p.get())
      .unwrap_or(4)
  }

  /// A clean API for your Tauri commands to push new images into the pipeline
  pub async fn ingest(&self, image: Image) {
    if let Err(e) = self.ingestion_tx.send(image).await {
      tracing::error!(error = ?e, "Pipeline ingestion queue is closed or failed");
    }
  }
}
