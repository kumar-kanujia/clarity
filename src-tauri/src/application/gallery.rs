use crate::{
  domain::dto::Image,
  infrastructure::{fs::ops, repo::image_repo},
  state::Db,
};

use std::io::Error;

pub async fn get_image_files_in_batch(
  db: &Db,
  offset: i64,
  limit: i64,
) -> Result<Vec<Image>, Error> {
  let files = image_repo::get_in_batch(db, offset, limit)
    .await
    .map_err(|_| Error::other("Something went wrong"))?;

  let images = files
    .into_iter()
    .filter(|file| ops::check_if_file_exists(&file.file_path).unwrap_or(false))
    .map(Image::from)
    .collect();

  Ok(images)
}
