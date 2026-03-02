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
  tx: mpsc::Sender<PipelineSignal>,
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

    let (tx, rx) = mpsc::channel::<PipelineSignal>(16);
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

    tauri::async_runtime::spawn(Self::run_dispatcher(
      rx,
      hash_notify,
      thumb_notify,
      delete_notify,
      shutdown_token,
    ));

    handle
  }

  async fn run_dispatcher(
    mut rx: mpsc::Receiver<PipelineSignal>,
    hash_notify: Arc<Notify>,
    thumb_notify: Arc<Notify>,
    delete_notify: Arc<Notify>,
    shutdown_token: CancellationToken,
  ) {
    tracing::info!("Emitting recovery signals for all stages.");
    hash_notify.notify_one();
    thumb_notify.notify_one();
    delete_notify.notify_one();

    loop {
      tokio::select! {
          biased;
          _ = shutdown_token.cancelled() => {
            tracing::info!("Signal dispatcher shutting down.");
            return;
          }
          res = rx.recv() => {
          match res {
            Some(PipelineSignal::ImageAdded)   => hash_notify.notify_one(),
            Some(PipelineSignal::ImageHashed)  => thumb_notify.notify_one(),
            Some(PipelineSignal::ImageDeleted) => delete_notify.notify_one(),
            None => {
              tracing::info!("All pipeline handles dropped. Shutting down dispatcher.");
              return;
            }
          }
        }
      }
    }
  }
}
