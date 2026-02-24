mod application;
mod domain;
mod infrastructure;
mod interface;
mod setup;
mod tests;

use crate::{
  interface::command::{
    gallery_command::{fetch_bin, fetch_favorites, fetch_gallery, fetch_tag_gallery},
    image_command::{
      delete_images, import_images, soft_delete_image, toggle_favorite, undo_soft_delete_image,
    },
    image_tag_command::{fetch_attached_tags, fetch_available_tags, toggle_tag},
    tag_command::{
      create_tag, delete_tag, edit_tag, fetch_all_tags, fetch_deleted_tags, fetch_top_tags,
      soft_delete_tag, undo_delete_tag,
    },
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
    .setup(app_setup)
    .invoke_handler(tauri::generate_handler![
      import_images,
      fetch_gallery,
      toggle_favorite,
      soft_delete_image,
      undo_soft_delete_image,
      delete_images,
      fetch_favorites,
      fetch_bin,
      fetch_tag_gallery,
      // Tags
      create_tag,
      edit_tag,
      soft_delete_tag,
      undo_delete_tag,
      delete_tag,
      fetch_top_tags,
      fetch_all_tags,
      fetch_deleted_tags,
      // Image tags
      toggle_tag,
      fetch_attached_tags,
      fetch_available_tags
    ])
    .build(tauri::generate_context!())
    .expect("error while running tauri application");

  app.run(app_callback);
}
