use crate::{
  application::dto::Image,
  infrastructure::{fs::ops, repo::image_repo},
  state::Db,
};

use std::io::Error;

pub async fn load_saved_images_in_batch(
  db: &Db,
  offset: i64,
  limit: i64,
) -> Result<Vec<Image>, Error> {
  tracing::info!("Get image files in batch called");
  let files = image_repo::get_images_batch(db, offset, limit)
    .await
    .map_err(|err| {
      tracing::error!("DB Error: {}", err);
      Error::other(format!("DB Error: {}", err))
    })?;

  let images = files
    .into_iter()
    .filter(|file| ops::verify_file_readbilty(&file.file_path).unwrap_or(false))
    .map(Image::from)
    .collect();
  tracing::info!("Get image files in batch completed");
  Ok(images)
}
