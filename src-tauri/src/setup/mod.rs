pub mod dbsetup;
pub mod error;
pub mod logger;
pub mod settings;

use crate::{
  application::worker::{
    Worker, file_hash_worker::FileHashWorker, thumbnail_worker::ThumbnailWorker,
  },
  infrastructure::{repo::image_repo::ImageRepository, utils::get_num_threads},
  setup::dbsetup::setup_db,
  state::AppState,
};

use std::{error::Error, sync::Arc};

use rayon::ThreadPoolBuilder;
use tauri::{App, AppHandle, Manager, RunEvent};
use tokio_util::sync::CancellationToken;

pub fn app_setup(app: &mut App) -> Result<(), Box<dyn Error>> {
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

  let image_repo = Arc::new(ImageRepository::new(db));

  let shutdown_clone = shutdown.clone();

  let file_hash_worker = FileHashWorker::new(image_repo.clone());
  tauri::async_runtime::spawn(async move { file_hash_worker.run(shutdown_clone).await });

  if let Some(thumbnail_worker) = ThumbnailWorker::new(app_handle, image_repo) {
    tauri::async_runtime::spawn(async move { thumbnail_worker.run(shutdown).await });
  }

  tracing::info!("Workers setup complete");

  Ok(())
}

pub fn app_callback(app_handle: &AppHandle, event: RunEvent) {
  if let RunEvent::ExitRequested { .. } = event {
    let state = app_handle.state::<AppState>();
    state.shutdown.cancel();
  }
}
