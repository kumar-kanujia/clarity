use crate::infrastructure::fs::{ops, scanner};
use crate::infrastructure::media::hashing;
use crate::infrastructure::repo::image_repo;
use crate::state::Db;

use futures::stream::{self, StreamExt};
use std::io::Error;
use std::path::Path;

async fn process_image(file: &Path, app_dir: &Path, db: &Db) -> Result<(), Error> {
  let file_id = hashing::generate_file_id(file)?;

  let image_file = scanner::build_image_file_from_path(file, &file_id)?;

  let target_dir = ops::get_file_dir(app_dir, &file_id);

  ops::ensure_dir(&target_dir)?;

  let target_path = target_dir.join(image_file.storage_file_name());

  ops::copy_file(file, &target_path)?;

  image_repo::save(db, &image_file)
    .await
    .map_err(|_| Error::other("Something went wrong!"))
}

pub async fn import_directory(source: &Path, app_dir: &Path, db: &Db) -> Result<(), Error> {
  let detected_images = scanner::scan_for_images(source);

  stream::iter(detected_images)
    .for_each_concurrent(50, |file| async move {
      if let Err(err) = process_image(&file, app_dir, db).await {
        eprintln!("Failed to process {}: {}", file.display(), err);
      }
    })
    .await;

  Ok(())
}
