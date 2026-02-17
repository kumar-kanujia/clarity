use crate::infrastructure::fs::error::FSError;

use std::fs::{self, File};
use std::io::ErrorKind;
use std::path::Path;

pub fn ensure_dir(path: &Path) -> Result<(), FSError> {
  fs::create_dir_all(path)?;
  Ok(())
}

pub fn is_file_readable(path: &str) -> Result<(), FSError> {
  match File::open(path) {
    Ok(_) => Ok(()),
    Err(e) => match e.kind() {
      ErrorKind::NotFound => Err(FSError::FileNotFound(path.to_string())),
      ErrorKind::PermissionDenied => Err(FSError::PermissionDenied(path.to_string())),
      _ => Err(FSError::Io(e)),
    },
  }
}

pub fn get_file_name(path: &str) -> String {
  let path = Path::new(path);
  path
    .file_name()
    .iter()
    .map(|f| f.to_string_lossy())
    .collect()
}
