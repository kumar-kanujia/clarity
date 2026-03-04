use sqlx::{Pool, Sqlite};
use tokio_util::sync::CancellationToken;

use crate::application::pipeline::orchestrator::PipelineHandle;

pub type Db = Pool<Sqlite>;

pub struct AppState {
  pub db: Db,
  pub pipline_handle: PipelineHandle,
  pub cancellation_token: CancellationToken,
}

impl AppState {
  pub fn new(
    db: Db,
    pipline_handle: PipelineHandle,
    cancellation_token: CancellationToken,
  ) -> Self {
    Self {
      db,
      pipline_handle,
      cancellation_token,
    }
  }
}
