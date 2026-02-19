mod application;
mod domain;
mod error;
mod infrastructure;
mod interface;
mod setup;
mod state;

use crate::{
  interface::command::{
    gallery_command::{fetch_bin, fetch_favorites, fetch_gallery},
    image_command::{import_images, soft_delete_image, toggle_favorite, undo_soft_delete_image},
    tag_command::{create_tag, fetch_top_tags, soft_tag_delete},
  },
  setup::{app_callback, app_setup, logger::Logger},
};

#[allow(clippy::missing_panics_doc)]
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  Logger::init();

  let app = tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![
      import_images,
      toggle_favorite,
      soft_delete_image,
      undo_soft_delete_image,
      fetch_gallery,
      fetch_favorites,
      fetch_bin,
      create_tag,
      fetch_top_tags,
      soft_tag_delete,
    ])
    .setup(app_setup)
    .build(tauri::generate_context!())
    .expect("error while running tauri application");

  app.run(app_callback);
}
