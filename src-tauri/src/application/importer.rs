use crate::infrastructure::fs::{ops, scanner};
use crate::infrastructure::media::hashing;
use crate::infrastructure::repo::image_repo;
use crate::state::Db;

use futures::stream::{self, StreamExt};
use std::io::Error;
use std::path::{Path, PathBuf};
use std::sync::Arc;

async fn process_single_image(file: &Path, app_dir: &Path, db: &Db) -> Result<(), Error> {
  let file_id = hashing::generate_file_id(file)?;

  let image_file = scanner::build_image_file_from_path(file, &file_id)?;

  let target_dir = ops::get_file_dir(app_dir, &file_id);

  ops::ensure_dir(&target_dir)?;

  let new_filename = image_file.get_storage_file_name();

  let target_path = ops::get_file_path(&new_filename, &target_dir);

  ops::copy_file(file, &target_path)?;

  if let Ok(_) = image_repo::save(db, &image_file).await {
    return Ok(());
  }
  Err(Error::other("Something went wrong!"))
}

pub async fn import_directory(source: &str, app_dir: &mut PathBuf, db: &Db) -> Result<(), String> {
  let source_path = Path::new(source);

  let detected_images = scanner::scan_for_images(source_path);

  let target_path = Arc::new(app_dir.clone());
  let db_handle = db.clone();

  let tasks = stream::iter(detected_images).map(|file| {
    let target_path = Arc::clone(&target_path);

    let db_handle = db_handle.clone();

    async move { process_single_image(&file, &target_path, &db_handle).await }
  });

  tasks.buffer_unordered(50).collect::<Vec<_>>().await;

  Ok(())
}
