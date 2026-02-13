pub mod file_hash_worker;
pub mod thumbnail_worker;

use std::{cmp, time::Duration};

use tauri::AppHandle;

use crate::setup::state::Db;

pub trait Worker {
  const IDEAL_WAIT_TIME: u64 = 10;

  fn get_batch_size(factor: i64) -> i64 {
    cmp::max(5, num_cpus::get() as i64 * factor)
  }

  async fn wait_for(time: u64) {
    tokio::time::sleep(Duration::from_secs(time)).await;
  }

  fn spawn(self, app: &AppHandle, db: Db);
}
