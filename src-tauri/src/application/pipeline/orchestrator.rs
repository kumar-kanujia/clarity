use std::path::PathBuf;
use std::thread;
use std::{cmp, sync::Arc};

use tokio::sync::{Notify, mpsc};
use tokio_util::sync::CancellationToken;

use crate::{
  application::pipeline::{
    signal::PipelineSignal,
    stage::PipelineStage,
    stages::{delete::DeleteStage, hash::HashStage, thumbnail::ThumbnailStage},
  },
  infrastructure::repo::image_repo::ImageRepository,
  setup::settings::{DELETE_BATCH_FACTOR, FILE_HASH_BATCH_FACTOR, THUMBNAIL_BATCH_FACTOR},
};

#[derive(Clone)]
pub struct PipelineHandle {
  tx: tokio::sync::mpsc::Sender<PipelineSignal>,
}

impl PipelineHandle {
  pub async fn emit(&self, signal: PipelineSignal) {
    if let Err(e) = self.tx.send(signal).await {
      tracing::error!(error = ?e, "Pipeline signal channel closed");
    }
  }
}

pub struct PipelineOrchestrator;

impl PipelineOrchestrator {
  fn init_rayon(thread_count: usize) {
    match rayon::ThreadPoolBuilder::new()
      .num_threads(thread_count)
      .thread_name(|i| format!("rayon-worker-{}", i))
      .build_global()
    {
      Ok(()) => tracing::info!(
        "Rayon thread pool initialized with {} threads",
        thread_count
      ),
      Err(e) => tracing::warn!(err = ?e, "Rayon global pool already initialized or failed"),
    }
  }

  fn num_threads() -> usize {
    thread::available_parallelism()
      .map(|p| p.get())
      .unwrap_or(4)
  }

  pub fn start(
    repo: Arc<ImageRepository>,
    thumbnail_target: PathBuf,
    shutdown_token: CancellationToken,
  ) -> PipelineHandle {
    let thread_count = Self::num_threads();
    Self::init_rayon(thread_count);

    let (tx, mut rx) = mpsc::channel::<PipelineSignal>(1024);
    let handle = PipelineHandle { tx };

    let hash_batch = cmp::max(4, thread_count * FILE_HASH_BATCH_FACTOR);
    let thumb_batch = cmp::max(1, thread_count * THUMBNAIL_BATCH_FACTOR);
    let delete_batch = cmp::max(1, thread_count * DELETE_BATCH_FACTOR);

    let hash_notify = Arc::new(Notify::new());
    let thumb_notify = Arc::new(Notify::new());
    let delete_notify = Arc::new(Notify::new());

    let hash_stage = Arc::new(HashStage::new(repo.clone(), handle.clone()));
    let thumb_stage = Arc::new(ThumbnailStage::new(repo.clone(), thumbnail_target));
    let delete_stage = Arc::new(DeleteStage::new(repo.clone()));

    tauri::async_runtime::spawn(hash_stage.run(
      Arc::clone(&hash_notify),
      hash_batch,
      shutdown_token.clone(),
    ));

    tauri::async_runtime::spawn(thumb_stage.run(
      Arc::clone(&thumb_notify),
      thumb_batch,
      shutdown_token.clone(),
    ));

    tauri::async_runtime::spawn(delete_stage.run(
      Arc::clone(&delete_notify),
      delete_batch,
      shutdown_token.clone(),
    ));

    let dispatcher_token = shutdown_token.clone();
    let hash_n = hash_notify.clone();
    let thumb_n = thumb_notify.clone();
    let delete_n = delete_notify.clone();

    tauri::async_runtime::spawn(async move {
      loop {
        tokio::select! {
            _ = dispatcher_token.cancelled() => {
                tracing::info!("Signal dispatcher shutting down.");
                break;
            }
            Some(signal) = rx.recv() => {
                match signal {
                    PipelineSignal::ImageAdded   => hash_n.notify_one(),
                    PipelineSignal::ImageHashed  => thumb_n.notify_one(),
                    PipelineSignal::ImageDeleted => delete_n.notify_one(),
                }
            }
        }
      }
    });

    let recovery_handle = handle.clone();
    tauri::async_runtime::spawn(async move {
      tracing::info!("Emitting recovery signals for all stages...");
      recovery_handle.emit(PipelineSignal::ImageAdded).await;
      recovery_handle.emit(PipelineSignal::ImageHashed).await;
      recovery_handle.emit(PipelineSignal::ImageDeleted).await;
      tracing::info!("Recovery signals emitted.");
    });

    handle
  }
}
