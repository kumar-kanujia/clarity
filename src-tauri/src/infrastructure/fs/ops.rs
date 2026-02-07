use std::fs;
use std::io::Error;
use std::path::{Path, PathBuf};

pub fn ensure_dir(path: &Path) -> Result<(), Error> {
  if !path.exists() {
    fs::create_dir_all(path)?;
  }
  Ok(())
}

pub fn copy_file(source: &Path, target_dir: &Path) -> Option<PathBuf> {
  if let Some(file_name) = source.file_name() {
    let new_path = target_dir.join(file_name);
    if fs::copy(source, &new_path).is_ok() {
      return Some(new_path);
    }
  }
  None
}
