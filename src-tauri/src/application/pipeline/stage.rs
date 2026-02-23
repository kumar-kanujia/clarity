use std::time::Instant;
use tokio::sync::mpsc;
use tokio_util::sync::CancellationToken;
use tracing::Instrument;

/// Defines a distinct step in the data processing pipeline.
pub trait PipelineStage: Clone + Send + Sync + 'static {
  type Input: Send + 'static;
  type Output: Send + 'static;
  type Error: std::fmt::Debug + Send;

  /// Unique name for logging (e.g., "hash_stage")
  fn name(&self) -> &'static str;

  /// Step 1: CPU-bound processing.
  /// This is strictly synchronous.
  /// Here we will use `rayon::par_iter()` to shred through the batch.
  fn process_batch(&self, items: Vec<Self::Input>) -> Vec<Self::Output>;

  /// Step 2: Handle results asynchronously.
  /// This is where we update the database and push items to the NEXT stage's queue.
  async fn handle_completed_batch(&self, items: Vec<Self::Output>) -> Result<u64, Self::Error>;

  /// The Event-Driven Engine.
  /// You do not need to override this; it handles the queue listening automatically.
  async fn run(
    self,
    mut rx: mpsc::Receiver<Self::Input>,
    batch_size: usize,
    shutdown: CancellationToken,
  ) {
    let name = self.name();
    let stage_id = uuid::Uuid::new_v4().to_string();
    let stage_span = tracing::info_span!("pipeline_stage", stage = name, id = %stage_id);

    async move {
      tracing::info!(batch_size, "Stage started, waiting for events...");
      let mut batch_counter = 0;

      loop {
        let mut batch = Vec::with_capacity(batch_size);

        // 1. SLEEP UNTIL WORK ARRIVES (0% CPU Usage)
        tokio::select! {
            _ = shutdown.cancelled() => {
                tracing::info!("Shutdown signal received, exiting stage.");
                break;
            }
            res = rx.recv() => {
                match res {
                    Some(item) => batch.push(item),
                    None => break, // The channel was closed
                }
            }
        }

        // 2. GREEDY GATHER
        // We have 1 item. Instantly scoop up any others waiting in the queue,
        // but stop when we hit the Orchestrator's batch size.
        while batch.len() < batch_size {
          if let Ok(item) = rx.try_recv() {
            batch.push(item);
          } else {
            break; // Queue is empty for now, proceed with what we have.
          }
        }

        batch_counter += 1;
        let batch_span = tracing::info_span!("batch", stage = name, bid = batch_counter);
        let start_time = Instant::now();
        let input_count = batch.len();

        // 3. PROCESS (Hand off to Rayon via spawn_blocking)
        let stage_clone = self.clone();
        let items_to_process = batch;

        let items_out = tokio::task::spawn_blocking(move || {
          // Because Rayon is initialized globally by the Orchestrator,
          // any Rayon methods used inside `process_batch` will automatically
          // use the global thread pool.
          stage_clone.process_batch(items_to_process)
        })
        .instrument(batch_span.clone())
        .await
        .unwrap_or_else(|e| {
          tracing::error!(error = ?e, "Stage panic/task failure");
          Vec::new()
        });

        if items_out.is_empty() {
          continue;
        }

        let items_out_len = items_out.len();

        // 4. ASYNC CLEANUP & ROUTING
        match self
          .handle_completed_batch(items_out)
          .instrument(tracing::info_span!("db_update", stage = name))
          .await
        {
          Ok(processed) => {
            tracing::info!(
              input = input_count,
              output = items_out_len,
              processed,
              duration_ms = start_time.elapsed().as_millis(),
              "Batch complete",
            );
          }
          Err(e) => tracing::error!(error = ?e, "Stage handling failed"),
        }
      }
    }
    .instrument(stage_span)
    .await;
  }
}
