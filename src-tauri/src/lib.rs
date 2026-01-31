mod commands;
mod features;
mod models;

use commands::{move_to_trash, scan_and_group_duplicates, scan_dir_for_images};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![
      scan_and_group_duplicates,
      scan_dir_for_images,
      move_to_trash
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
