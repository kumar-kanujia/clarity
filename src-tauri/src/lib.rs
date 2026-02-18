mod application;
mod domain;
mod error;
mod infrastructure;
mod interface;
mod setup;
mod state;

use crate::{
  interface::commands::{
    gallery_commands::{fetch_gallery, mark_image_deleted, toggle_favorite},
    image_commands::{
      fetch_image_by_ids, fetch_images, fetch_images_grouped_by_hash, fetch_images_with_tag,
      import_images, search_images,
    },
    tag_commands::{
      create_tag, delete_tag, fetch_system_tags, fetch_user_tags, toggle_tag_on_image,
    },
  },
  setup::{logger, setup_app},
  state::AppState,
};

use tauri::{Manager, RunEvent};

pub static IMAGE_DIR: &str = "images";

#[allow(clippy::missing_panics_doc)]
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  logger::init_log();

  let app = tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![
      import_images,
      fetch_images,
      fetch_images_grouped_by_hash,
      create_tag,
      fetch_user_tags,
      fetch_system_tags,
      delete_tag,
      toggle_tag_on_image,
      fetch_images_with_tag,
      fetch_image_by_ids,
      search_images,
      fetch_gallery,
      toggle_favorite,
      mark_image_deleted
    ])
    .setup(setup_app)
    .build(tauri::generate_context!())
    .expect("error while running tauri application");

  app.run(|app_handle, event| {
    if let RunEvent::ExitRequested { .. } = event {
      let state = app_handle.state::<AppState>();
      state.shutdown.cancel();
    }
  });
}
