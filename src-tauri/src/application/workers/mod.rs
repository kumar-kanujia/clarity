pub mod file_hash_worker;
pub mod thumbnail_worker;

use std::fmt::Debug;
use std::time::Instant;
use std::{cmp, time::Duration};
use tokio_util::sync::CancellationToken;
use tracing::Instrument;
use uuid::Uuid;

const IDEAL_WAIT_TIME: u64 = 5 * 1000;
const IDEAL_HOLD_TIME: u64 = 30 * 1000;

pub trait Worker: Clone + Send + Sync + 'static {
  /// The data fetched from the DB
  type Input: Send + 'static;

  /// The data produced after processing
  type Output: Send + 'static;

  /// The error type
  type Error: Debug + Send;

  /// Unique name for logging (e.g., "thumbnail_worker")
  fn name(&self) -> &'static str;

  /// CPU Multiplier for batch size
  fn batch_factor(&self) -> usize;

  /// Step 1: Fetch data from DB
  async fn fetch_batch(&self, limit: i64) -> Result<Vec<Self::Input>, Self::Error>;

  /// Step 2: CPU-bound processing (Sync function, not Async)
  /// This is run inside a blocking thread automatically by the run() method.
  fn process_batch(&self, items: Vec<Self::Input>) -> Vec<Self::Output>;

  /// Step 3: Update DB with results
  async fn update_batch(&self, items: &[Self::Output]) -> Result<u64, Self::Error>;

  /// Helper: Calculate dynamic batch size
  fn get_batch_size(&self) -> i64 {
    cmp::max(4, num_cpus::get() as i64 * self.batch_factor() as i64)
  }

  /// Helper: Sleep logic
  async fn sleep_or_shutdown(ms: u64, shutdown: &CancellationToken) -> bool {
    tokio::select! {
        _ = shutdown.cancelled() => true,
        _ = tokio::time::sleep(Duration::from_millis(ms)) => false,
    }
  }

  async fn run(self, shutdown: CancellationToken) {
    let name = self.name();
    let batch_size = self.get_batch_size();

    let worker_id = Uuid::new_v4().to_string();

    let worker_span = tracing::info_span!(
        parent: None,
        "worker",
        worker = name,
        id = %worker_id,
        limit = %batch_size
    );

    async move {
      tracing::info!("Worker started");

      let mut batch_counter = 0;

      loop {
        batch_counter += 1;

        // Unique span for this specific batch
        let batch_span = tracing::info_span!("batch", worker = name, bid = batch_counter);

        let batch_result = async {
          let start_time = Instant::now();

          // --- 1. FETCH ---
          let items_in = match self.fetch_batch(batch_size).await {
            Ok(items) if items.is_empty() => {
              tracing::debug!("Queue empty, sleeping...");
              return Ok(false);
            }
            Ok(items) => items,
            Err(e) => return Err(e),
          };

          let input_count = items_in.len();
          tracing::info!(count = input_count, "Items fetched");

          // --- 2. PROCESS (Blocking) ---
          // We clone `self` to move it into the thread, that's why we require Clone
          let worker_clone = self.clone();
          let current_span = tracing::Span::current();

          let items_out = tokio::task::spawn_blocking(move || {
            let _guard = current_span.enter();
            worker_clone.process_batch(items_in)
          })
          .await
          .map_err(|e| tracing::error!(error = ?e, "Worker panic/task failure"))
          .ok();

          let items_out = match items_out {
            Some(items) => items,
            None => return Ok(true),
          };

          // --- 3. UPDATE ---
          match self
            .update_batch(&items_out)
            .instrument(tracing::info_span!("db_update", worker = name,))
            .await
          {
            Ok(updated) => {
              tracing::info!(
                input = input_count,
                output = items_out.len(),
                updated = updated,
                duration_ms = start_time.elapsed().as_millis(),
                "Batch complete",
              );
              Ok(true)
            }
            Err(e) => Err(e),
          }
        }
        .instrument(batch_span)
        .await;

        match batch_result {
          Ok(true) => { /* Loop immediately */ }
          Ok(false) => {
            if Self::sleep_or_shutdown(IDEAL_WAIT_TIME, &shutdown).await {
              tracing::info!("Shutdown signal received");
              break;
            }
          }
          Err(e) => {
            tracing::error!(error = ?e, "Worker cycle failed");
            if Self::sleep_or_shutdown(IDEAL_HOLD_TIME, &shutdown).await {
              break;
            }
          }
        }
      }
    }
    .instrument(worker_span)
    .await;
  }
}
