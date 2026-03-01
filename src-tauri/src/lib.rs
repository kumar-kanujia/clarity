mod application;
mod domain;
mod infrastructure;
mod interface;
mod setup;
mod tests;

use crate::{
  interface::command::{
    gallery_command::{fetch_all, fetch_favorites, fetch_tag_gallery, fetch_trash},
    image_command::{
      empty_trash, import_images, move_to_trash, remove_from_trash, restore_from_trash,
      toggle_favorite,
    },
    image_tag_command::{
      attach_tag, attached_tags, available_tags, fetch_attached_tags, fetch_available_tags,
      remove_tag, toggle_tag,
    },
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
      fetch_all,
      fetch_favorites,
      toggle_favorite,
      fetch_trash,
      move_to_trash,
      restore_from_trash,
      empty_trash,
      //
      remove_from_trash,
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
      attach_tag,
      remove_tag,
      fetch_attached_tags,
      fetch_available_tags,
      attached_tags,
      available_tags
    ])
    .build(tauri::generate_context!())
    .expect("error while running tauri application");

  app.run(app_callback);
}
