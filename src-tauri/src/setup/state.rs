use sqlx::{Pool, Sqlite};
use tokio_util::sync::CancellationToken;

use crate::application::pipeline::orchestrator::PipelineOrchestrator;

pub type Db = Pool<Sqlite>;

pub struct AppState {
  pub db: Db,
  pub pipline: PipelineOrchestrator,
  pub cancellation_token: CancellationToken,
}

impl AppState {
  pub fn new(db: Db, pipline: PipelineOrchestrator, cancellation_token: CancellationToken) -> Self {
    Self {
      db,
      pipline,
      cancellation_token,
    }
  }
}
