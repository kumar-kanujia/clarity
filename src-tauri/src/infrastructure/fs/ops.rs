use std::fs::{self};
use std::io::Error;
use std::path::{Path, PathBuf};

pub fn ensure_dir(path: &Path) -> Result<(), Error> {
  fs::create_dir_all(path)?;
  Ok(())
}

pub fn get_file_dir(app_dir: &Path, file_id: &str) -> PathBuf {
  app_dir
    .join("img")
    .join(&file_id[0..2])
    .join(&file_id[2..4])
}

pub fn copy_file(source: &Path, target: &Path) -> Result<PathBuf, Error> {
  fs::copy(source, target)?;
  Ok(target.to_path_buf())
}
