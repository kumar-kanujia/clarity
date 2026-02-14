pub mod file_hash_worker;
pub mod thumbnail_worker;

use std::{cmp, time::Duration};
use tokio_util::sync::CancellationToken;

use crate::infrastructure::repo::error::DatabaseError;
use crate::setup::state::Db;

use crate::domain::image::Image;

const IDEAL_WAIT_TIME: u64 = 5 * 1000;
const IDEAL_HOLD_TIME: u64 = 30 * 1000;

pub trait Worker: Clone + Send + Sync + 'static {
  /// Unique name for logging (e.g., "thumbnail_worker")
  fn name(&self) -> &'static str;

  /// CPU Multiplier for batch size
  fn batch_factor(&self) -> usize;

  /// Step 1: Fetch data from DB
  async fn fetch_batch(&self, db: &Db, limit: i64) -> Result<Vec<Image>, DatabaseError>;

  /// Step 2: CPU-bound processing (Sync function, not Async)
  /// This is run inside a blocking thread automatically by the run() method.
  fn process_batch(&self, items: Vec<Image>) -> Vec<Image>;

  /// Step 3: Update DB with results
  async fn update_batch(&self, db: &Db, items: &Vec<Image>) -> Result<u64, DatabaseError>;

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

  async fn run(self, db: Db, shutdown: CancellationToken) {
    let name = self.name();
    let batch_size = self.get_batch_size();

    let span = tracing::info_span!("worker_loop", worker = name, %batch_size);
    let _enter = span.enter();

    loop {
      let batch_span = tracing::info_span!("worker_batch", worker = name);
      let _guard = batch_span.enter();
      let start_time = std::time::Instant::now();

      // --- 1. FETCH ---
      let mut items = match self.fetch_batch(&db, batch_size).await {
        Ok(items) if items.is_empty() => {
          if Self::sleep_or_shutdown(IDEAL_WAIT_TIME, &shutdown).await {
            tracing::info!("{} shutting down", name);
            break;
          }
          continue;
        }
        Ok(items) => items,
        Err(e) => {
          tracing::error!(error = ?e, "DB Fetch failed");
          if Self::sleep_or_shutdown(IDEAL_HOLD_TIME, &shutdown).await {
            break;
          }
          continue;
        }
      };

      tracing::info!(count = items.len(), "Batch fetched");

      // --- 2. PROCESS (Blocking) ---
      // We clone `self` to move it into the thread, that's why we require Clone
      let worker_clone = self.clone();
      items = match tauri::async_runtime::spawn_blocking(move || worker_clone.process_batch(items))
        .await
      {
        Ok(res) => res,
        Err(e) => {
          tracing::error!(error = ?e, "Worker task panicked");
          if Self::sleep_or_shutdown(IDEAL_HOLD_TIME, &shutdown).await {
            break;
          }
          continue;
        }
      };

      // --- 3. UPDATE ---
      match self.update_batch(&db, &items).await {
        Ok(updated) => {
          tracing::info!(
            processed = items.len(),
            updated = updated,
            elapsed_ms = start_time.elapsed().as_millis(),
            "Batch processed successfully"
          );
        }
        Err(e) => {
          tracing::error!(error = ?e, "Bulk update failed");
          if Self::sleep_or_shutdown(IDEAL_HOLD_TIME, &shutdown).await {
            break;
          }
        }
      }
    }
  }
}
