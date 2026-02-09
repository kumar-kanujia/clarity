use std::{io::Error, path::Path};

use crate::{
  domain::dto::Image,
  infrastructure::{fs::ops, repo::image_repo},
  state::Db,
};

pub async fn get_image_files(app_dir: &Path, db: &Db) -> Result<Vec<Image>, Error> {
  let files = image_repo::get_all_paths(db)
    .await
    .map_err(|_| Error::other("Something went wrong"))?;

  let images = files
    .into_iter()
    .map(|file| {
      let path = ops::get_file_dir(app_dir, &file.file_id).join(file.storage_file_name());
      let mut image = Image::from(file);
      image.path = path.display().to_string();
      image
    })
    .collect();

  Ok(images)
}

pub async fn get_image_files_in_batch(
  app_dir: &Path,
  db: &Db,
  offset: i64,
  limit: i64,
) -> Result<Vec<Image>, Error> {
  let files = image_repo::get_in_batch(db, offset, limit)
    .await
    .map_err(|_| Error::other("Something went wrong"))?;

  let images = files
    .into_iter()
    .map(|file| {
      let path = ops::get_file_dir(app_dir, &file.file_id).join(file.storage_file_name());
      let mut image = Image::from(file);
      image.path = path.display().to_string();
      image
    })
    .collect();

  Ok(images)
}
