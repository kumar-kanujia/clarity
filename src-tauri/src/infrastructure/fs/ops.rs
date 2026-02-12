use std::fs::{self, File};
use std::io::ErrorKind;
use std::path::Path;

use crate::infrastructure::fs::error::FileAccessError;

pub fn ensure_dir(path: &Path) -> Result<(), FileAccessError> {
  fs::create_dir_all(path)?;
  Ok(())
}

pub fn is_file_readable(path: &str) -> Result<(), FileAccessError> {
  match File::open(path) {
    Ok(_) => Ok(()),
    Err(e) => match e.kind() {
      ErrorKind::NotFound => Err(FileAccessError::FileNotFound(path.to_string())),
      ErrorKind::PermissionDenied => Err(FileAccessError::PermissionDenied(path.to_string())),
      _ => Err(FileAccessError::Io(e)),
    },
  }
}
