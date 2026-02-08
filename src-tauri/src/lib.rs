mod application;
mod domain;
mod infrastructure;
mod interface;
mod old;
mod state;

use interface::commands::{get_saved_images, save_dir, save_images};
use old::{move_to_trash, scan_and_group_duplicates, scan_dir_for_images};

use tauri::Manager;

use crate::{interface::setup::setup_db, state::AppState};

#[allow(clippy::missing_panics_doc)]
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![
      scan_and_group_duplicates,
      scan_dir_for_images,
      move_to_trash,
      get_saved_images,
      save_dir,
      save_images
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
