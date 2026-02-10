use std::fs::{self};
use std::io::Error;
use std::path::{Path, PathBuf};

use crate::state::IMAGE_DIR;

pub fn ensure_dir(path: &Path) -> Result<(), Error> {
  fs::create_dir_all(path)?;
  Ok(())
}

#[allow(dead_code)]
pub fn get_file_dir(app_dir: &Path, file_id: &str) -> PathBuf {
  app_dir
    .join(IMAGE_DIR)
    .join(&file_id[0..2])
    .join(&file_id[2..4])
}

#[allow(dead_code)]
pub fn copy_file(source: &Path, target: &Path) -> Result<PathBuf, Error> {
  fs::copy(source, target)?;
  Ok(target.to_path_buf())
}

#[allow(dead_code)]
pub async fn copy_file_async(source: &Path, target: &Path) -> Result<PathBuf, Error> {
  tokio::fs::copy(source, target).await?;
  Ok(target.to_path_buf())
}

pub fn check_if_file_exists(path: &str) -> Result<bool, Error> {
  let path = Path::new(path);
  Ok(path.exists())
}
