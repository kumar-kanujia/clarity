mod application;
mod domain;
mod infrastructure;
mod interface;
mod old;
mod state;

use crate::{
  interface::{
    commands::{load_saved_images_in_batch, save_images},
    logsetup::{LOG_LEVEL, get_log_target},
    setup::setup_db,
  },
  state::AppState,
};
use old::{move_to_trash, scan_and_group_duplicates, scan_dir_for_images};

use tauri::Manager;
use tauri_plugin_log::fern::colors::ColoredLevelConfig;

#[allow(clippy::missing_panics_doc)]
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(
      tauri_plugin_log::Builder::new()
        .level(LOG_LEVEL)
        .target(get_log_target())
        .with_colors(ColoredLevelConfig::default())
        .build(),
    )
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![
      scan_and_group_duplicates,
      scan_dir_for_images,
      move_to_trash,
      save_images,
      load_saved_images_in_batch
    ])
    .setup(|app| {
      tauri::async_runtime::block_on(async move {
        let db = setup_db(app).await.unwrap();
        app.manage(AppState { db });
      });
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
