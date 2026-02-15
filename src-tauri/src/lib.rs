mod application;
mod domain;
mod error;
mod infrastructure;
mod interface;
mod setup;

use crate::{
  interface::command::{
    create_tag, fetch_images, fetch_images_grouped_by_hash, fetch_system_tags, fetch_user_tags,
    import_images,
  },
  setup::{setup_app, state::AppState, tracesetup},
};

use tauri::{Manager, RunEvent};

pub static IMAGE_DIR: &str = "images";

#[allow(clippy::missing_panics_doc)]
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tracesetup::init_tracing();
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
