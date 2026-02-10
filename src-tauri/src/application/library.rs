use std::io::Error;

use crate::{domain::dto::Image, infrastructure::repo::image_repo, state::Db};

pub async fn get_image_files_in_batch(
  db: &Db,
  offset: i64,
  limit: i64,
) -> Result<Vec<Image>, Error> {
  let files = image_repo::get_in_batch(db, offset, limit)
    .await
    .map_err(|_| Error::other("Something went wrong"))?;

  let images = files.into_iter().map(Image::from).collect();

  Ok(images)
}
