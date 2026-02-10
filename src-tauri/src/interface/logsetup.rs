#[cfg(debug_assertions)]
use log::LevelFilter;
use tauri_plugin_log::{Target, TargetKind};

pub fn get_log_target() -> Target {
  if cfg!(debug_assertions) {
    Target::new(TargetKind::LogDir {
      file_name: Some("clarity".to_string()),
    })
  } else {
    Target::new(TargetKind::Stdout)
  }
}

#[cfg(debug_assertions)]
pub const LOG_LEVEL: LevelFilter = LevelFilter::Info;

#[cfg(not(debug_assertions))]
pub const LOG_LEVEL: LevelFilter = LevelFilter::Error;
