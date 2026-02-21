use sqlx::{Pool, Sqlite};
use tokio_util::sync::CancellationToken;

pub type Db = Pool<Sqlite>;

pub struct AppState {
  pub db: Db,
  pub shutdown: CancellationToken,
}

impl AppState {
  pub fn new(db: Db, shutdown: CancellationToken) -> Self {
    Self { db, shutdown }
  }
}
