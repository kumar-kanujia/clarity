use crate::{infrastructure::repo::error::DatabaseError, setup::state::Db};
use std::{
  sync::Arc,
  time::{Duration, Instant},
};
use tokio_util::sync::CancellationToken;
use tracing::Instrument;

const IDEAL_WAIT_TIME: Duration = Duration::from_secs(5);
const IDEAL_HOLD_TIME: Duration = Duration::from_secs(20);

async fn wait_or_shutdown(duration: Duration, token: &CancellationToken) -> bool {
  tokio::select! {
      _ = tokio::time::sleep(duration) => false,
      _ = token.cancelled() => true,
  }
}

#[async_trait::async_trait]
pub trait BatchWorker: Send + Sync + 'static {
  type Input: Send + 'static;
  type Output: Send + 'static;

  fn name(&self) -> &'static str;

  async fn fetch(&self, db: &Db, batch_size: i64) -> Result<Vec<Self::Input>, DatabaseError>;

  fn process(&self, items: Vec<Self::Input>) -> Vec<Self::Output>;

  async fn persist(&self, db: &Db, items: &[Self::Output]) -> Result<usize, DatabaseError>;
}

pub async fn run_worker<P: Copy>(
  processor: P,
  db: Db,
  shutdown: CancellationToken,
  max_batch_size: i64,
) where
  P: BatchWorker,
{
  let worker_name = processor.name();
  let span = tracing::info_span!("worker_loop", worker = worker_name, %max_batch_size);

  tauri::async_runtime::spawn(
    async move {
      loop {
        let batch_span = tracing::info_span!("{} batch", worker_name);
        let _enter = batch_span.enter();
        let start_time = Instant::now();

        // --- 1. Fetch ---
        let items = match processor.fetch(&db, max_batch_size).await {
          Ok(items) if items.is_empty() => {
            if wait_or_shutdown(IDEAL_WAIT_TIME, &shutdown).await {
              tracing::info!("{} shutting down", worker_name);
              break;
            }
            continue;
          }
          Ok(items) => items,
          Err(e) => {
            tracing::error!(error = ?e, worker = worker_name, "DB Fetch failed");
            if wait_or_shutdown(IDEAL_HOLD_TIME, &shutdown).await {
              break;
            }
            continue;
          }
        };

        tracing::debug!(count = items.len(), batch = "Batch fetched");

        // --- 2. Process (Blocking) ---
        // We clone processor here. If processor is large, wrap it in Arc internally.
        // But usually, these structs are small (zero-sized or just hold a PathBuf).
        // Note: Since 'process' takes &self, we might need the processor to be Arc-wrapped
        // or lightweight. For this implementation, we assume the Processor is cheap to clone
        // OR we use a pattern where we don't move the processor in, but that's harder with 'static constraints.
        // EASIEST FIX: Require Processor to be Clone, or Arc<Processor>.

        // Actually, to avoid Clone constraints on the Trait, let's wrap logic in a move closure
        // However, we can't easily move `&self` into spawn_blocking without Arc.
        // Let's assume the user passes an Arc<P> or P is Sync.
        let processor_ref = Arc::new(processor);
        // Note: In the actual implementation below, we will just Arc the processor before calling run.

        let p_clone = processor_ref.clone();
        let processed_result =
          tauri::async_runtime::spawn_blocking(move || p_clone.process(items)).await;

        let items_out = match processed_result {
          Ok(res) => res,
          Err(e) => {
            tracing::error!(error = ?e, worker = worker_name, "Worker task panicked");
            if wait_or_shutdown(IDEAL_HOLD_TIME, &shutdown).await {
              break;
            }
            continue;
          }
        };

        // --- 3. Persist ---
        match processor_ref.persist(&db, &items_out).await {
          Ok(count) => {
            tracing::info!(
              processed = items_out.len(),
              updated = count,
              elapsed_ms = start_time.elapsed().as_millis(),
              "Batch processed successfully"
            );
          }
          Err(e) => {
            tracing::error!(error = ?e, worker = worker_name, "Bulk update failed");
            if wait_or_shutdown(IDEAL_HOLD_TIME, &shutdown).await {
              break;
            }
          }
        }

        // Recover ownership for next loop iteration (conceptual, since we used Arc, we are good)
        // If we need mutable state in processor, we need a different approach,
        // but your workers look stateless.
        // We need to unwrap the Arc if we want to drop it, but we can just keep cloning.
        // To make the loop work with the Arc created inside, we actually need to create the Arc OUTSIDE.
        // See revised implementation below.
      }
    }
    .instrument(span),
  );
}
