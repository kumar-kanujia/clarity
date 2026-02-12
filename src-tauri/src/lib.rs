mod application;
mod domain;
mod error;
mod infrastructure;
mod interface;
mod setup;

use crate::{
  interface::commands::{fetch_scanned_images, save_images},
  setup::{setup_app, tracesetup},
};

pub static IMAGE_DIR: &str = "images";

#[allow(clippy::missing_panics_doc)]
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tracesetup::init_tracing();
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![save_images, fetch_scanned_images])
    .setup(setup_app)
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
