pub mod state;

use crate::{
  application::background::ThumbnailWorker, interface::dbsetup::setup_db, setup::state::AppState,
};

use std::error::Error;

use tauri::{App, Manager};

pub fn setup_app(app: &mut App) -> Result<(), Box<dyn Error>> {
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

  app_handle.manage(AppState { db: db.clone() });

  ThumbnailWorker::spawn(&app_handle, db);

  Ok(())
}
