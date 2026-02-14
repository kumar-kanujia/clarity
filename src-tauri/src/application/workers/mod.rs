pub mod batch_worker;
pub mod file_hash_worker;
pub mod thumbnail_worker;

use std::{cmp, time::Duration};

use tauri::AppHandle;
use tokio_util::sync::CancellationToken;

use crate::setup::state::Db;

pub trait Worker {
  /// 5 Sec
  const IDEAL_WAIT_TIME: u64 = 5 * 1000;

  const IDEAL_HOLD_TIME: u64 = 30 * 1000;

  fn get_batch_size(factor: i64) -> i64 {
    cmp::max(4, num_cpus::get() as i64 * factor)
  }

  async fn sleep_or_shutdown(ms: u64, shutdown: &CancellationToken) -> bool {
    tokio::select! {
      _ = shutdown.cancelled() => true,
      _ = tokio::time::sleep(Duration::from_millis(ms)) => false,
    }
  }

  fn spawn(self, app: &AppHandle, db: Db, shutdown: CancellationToken);
}
