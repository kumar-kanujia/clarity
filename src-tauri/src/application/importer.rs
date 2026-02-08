use crate::infrastructure::fs::{ops, scanner};
use crate::infrastructure::media::hashing;
use crate::infrastructure::repo::image_repo;
use crate::state::Db;

use futures::stream::{self, StreamExt};
use std::io::Error;
use std::path::Path;

async fn import_image_file(file: &Path, app_dir: &Path, db: &Db) -> Result<(), Error> {
  if !scanner::is_image_file(file) {
    return Err(Error::other("Not an image file"));
  }

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

pub async fn import_image_files<I, P>(files: I, app_dir: &Path, db: &Db) -> Result<(), Error>
where
  I: IntoIterator<Item = P>,
  P: AsRef<Path>,
{
  stream::iter(files)
    .for_each_concurrent(10, |file| async move {
      let path = file.as_ref();

      if let Err(err) = import_image_file(path, app_dir, db).await {
        eprintln!("Failed to process {}: {}", path.display(), err);
      }
    })
    .await;

  Ok(())
}

pub async fn import_path(path: &Path, app_dir: &Path, db: &Db) -> Result<(), Error> {
  let files = scanner::scan_for_image_files(path);
  import_image_files(files, app_dir, db).await
}
