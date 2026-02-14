pub mod dbsetup;
pub mod state;
pub mod tracesetup;

use crate::{
  application::workers::{Worker, file_hash_worker::FileHashWorker},
  infrastructure::system::get_num_threads,
  setup::{dbsetup::setup_db, state::AppState},
};

use std::error::Error;

use rayon::ThreadPoolBuilder;
use tauri::{App, Manager};
use tokio_util::sync::CancellationToken;

pub fn setup_app(app: &mut App) -> Result<(), Box<dyn Error>> {
  let span = tracing::info_span!("setup_app");
  let _enter = span.enter();

  if let Err(err) = ThreadPoolBuilder::new()
    .num_threads(get_num_threads())
    .thread_name(|i| format!("rayon-worker-{}", i))
    .build_global()
  {
    tracing::error!(err = ?err, "Failed to initialize Rayon thread pool");
  }

  let app_handle = app.handle();

  tracing::info!("Setting up database");

  let db =
    tauri::async_runtime::block_on(async { setup_db(&app_handle).await }).map_err(|err| {
      tracing::error!(error = ?err, "DB Error");
      err
    })?;

  tracing::info!("Database setup complete");

  let shutdown = CancellationToken::new();

  app_handle.manage(AppState {
    db: db.clone(),
    shutdown: shutdown.clone(),
  });

  tracing::info!("Setting up Workers");

  FileHashWorker::default().spawn(&app_handle, db, shutdown.clone());
  // ThumbnailWorker::default().spawn(&app_handle, db);
  //
  tracing::info!("Workers setup complete");

  Ok(())
}
