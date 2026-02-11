mod application;
mod domain;
mod error;
mod infrastructure;
mod interface;
mod old;
mod state;

use crate::{
  application::background::ThumbnailWorker,
  interface::{
    commands::{load_saved_images, save_images},
    dbsetup::setup_db,
    tracesetup,
  },
  state::AppState,
};
use old::{move_to_trash, scan_and_group_duplicates, scan_dir_for_images};

use tauri::Manager;

#[allow(clippy::missing_panics_doc)]
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tracesetup::init_tracing();
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![
      scan_and_group_duplicates,
      scan_dir_for_images,
      move_to_trash,
      save_images,
      load_saved_images
    ])
    .setup(|app| {
      let app_handle = app.handle();

      tauri::async_runtime::block_on(async move {
        match setup_db(app_handle).await {
          Ok(db) => {
            app_handle.manage(AppState { db: db.clone() });
            ThumbnailWorker::spawn(&app_handle.clone(), db.clone());
          }
          Err(err) => log::error!("DB Error: {}", err),
        }
      });

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
