mod application;
mod domain;
mod infrastructure;
mod interface;
mod setup;
mod tests;

use crate::{
  interface::command::{
    gallery_command::{fetch_all_images, fetch_favorites, fetch_tag_gallery, fetch_trash},
    image_command::{
      delete_from_trash, empty_trash, import_images, move_to_trash, restore_from_trash,
      toggle_favorite,
    },
    image_tag_command::{
      attach_tag, attached_tags, attached_tags_multiple, available_tags, available_tags_multiple,
      remove_tag, toggle_tag,
    },
    tag_command::{
      create_tag, delete_tag, edit_tag, fetch_active_tags, fetch_inactive_tags, fetch_top_tags,
      mark_tag_active, mark_tag_inactive,
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
      // Images
      import_images,
      fetch_all_images,
      fetch_favorites,
      toggle_favorite,
      fetch_trash,
      move_to_trash,
      restore_from_trash,
      empty_trash,
      // Tags
      create_tag,
      edit_tag,
      fetch_top_tags,
      fetch_active_tags,
      fetch_inactive_tags,
      mark_tag_inactive,
      mark_tag_active,
      delete_tag,
      // Image Tags
      attached_tags,
      available_tags,
      toggle_tag,
      //
      available_tags_multiple,
      attached_tags_multiple,
      delete_from_trash,
      fetch_tag_gallery,
      attach_tag,
      remove_tag,
    ])
    .build(tauri::generate_context!())
    .expect("error while running tauri application");

  app.run(app_callback);
}
