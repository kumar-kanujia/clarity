pub mod dbsetup;
pub mod error;
pub mod logger;
pub mod settings;
pub mod state;

use crate::{
  application::{pipeline::orchestrator::PipelineOrchestrator, service::thumbnail_service},
  infrastructure::repo::image_repo::ImageRepository,
  setup::{dbsetup::setup_db, state::AppState},
};

use std::{error::Error, sync::Arc};

use tauri::{App, AppHandle, Manager, RunEvent};
use tokio_util::sync::CancellationToken;

pub fn app_setup(app: &mut App) -> Result<(), Box<dyn Error>> {
  let span = tracing::info_span!("setup_app");
  let _enter = span.enter();

  let app_handle = app.handle();

  tracing::info!("Setting up database");

  let db =
    tauri::async_runtime::block_on(async { setup_db(&app_handle).await }).map_err(|err| {
      tracing::error!(error = ?err, "DB Error");
      err
    })?;

  tracing::info!("Database setup complete");

  let cancellation_token = CancellationToken::new();

  let image_repo = Arc::new(ImageRepository::new(db.clone()));

  let thumbnail_path = thumbnail_service::get_thumbnail_target(&app_handle)?;

  let cancellation_token = cancellation_token.clone();

  let orchestrator =
    PipelineOrchestrator::start(image_repo, thumbnail_path, cancellation_token.clone());

  app_handle.manage(AppState::new(db.clone(), orchestrator, cancellation_token));

  Ok(())
}

pub fn app_callback(app_handle: &AppHandle, event: RunEvent) {
  if let RunEvent::ExitRequested { .. } = event {
    let state = app_handle.state::<AppState>();
    state.cancellation_token.cancel();
  }
}
