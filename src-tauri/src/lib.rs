mod application;
mod domain;
mod error;
mod infrastructure;
mod interface;
mod old;
mod setup;

use crate::{
  interface::{
    commands::{fetch_scanned_images, save_images},
    tracesetup,
  },
  setup::setup_app,
};

use old::{move_to_trash, scan_and_group_duplicates, scan_dir_for_images};

pub static IMAGE_DIR: &str = "images";

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
      fetch_scanned_images
    ])
    .setup(setup_app)
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
