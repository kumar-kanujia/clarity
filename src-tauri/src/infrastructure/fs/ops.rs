use std::fs::{self};
use std::io::Error;
use std::path::{Path, PathBuf};

pub fn ensure_dir(path: &Path) -> Result<(), Error> {
  if !path.exists() {
    fs::create_dir_all(path)?;
  }
  Ok(())
}

pub fn get_file_dir(app_dir: &Path, file_id: &str) -> PathBuf {
  app_dir
    .join("img")
    .join(&file_id[0..2])
    .join(&file_id[2..4])
}

pub fn get_file_path(file_name: &str, target: &Path) -> PathBuf {
  target.join(file_name)
}

pub fn copy_file(file_path: &Path, target_path: &Path) -> Result<(), Error> {
  fs::copy(file_path, target_path)?;
  Ok(())
}
