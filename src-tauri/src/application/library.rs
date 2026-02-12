use crate::{
  application::dtos::Image,
  error::AppError,
  infrastructure::{fs::ops, repo::image_repo},
  setup::state::Db,
};

pub async fn list_scanned_images(
  db: &Db,
  last_max_tx: i64,
  last_seq_id: i64,
  limit: i64,
) -> Result<Vec<Image>, AppError> {
  let files = image_repo::list_images_paginated(db, last_max_tx, last_seq_id, limit).await?;

  let mut unreadable_count = 0;

  let images = files
    .into_iter()
    .filter(|file| match ops::is_file_readable(&file.file_path) {
      Ok(()) => true,
      Err(err) => {
        tracing::info!("Unreadable image: {:?}", err);
        unreadable_count += 1;
        false
      }
    })
    .map(Image::from)
    .collect();

  if unreadable_count > 0 {
    tracing::warn!(
      unreadable = unreadable_count,
      "Unreadable images skipped during pagination"
    );
  }

  Ok(images)
}
