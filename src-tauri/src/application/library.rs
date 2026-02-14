use crate::{
  domain::image::Image,
  error::AppError,
  infrastructure::{fs::ops, repo::image_repo, system::format_datetime},
  interface::dto::{ImageCursor, ImageDto, PaginatedImages},
  setup::state::Db,
};

#[tracing::instrument]
pub async fn list_scanned_images(
  db: &Db,
  limit: i64,
  cursor: Option<(String, i64)>,
) -> Result<PaginatedImages, AppError> {
  let raw_images = image_repo::list_images_paginated(db, limit + 1, cursor).await?;

  let next_cursor = if raw_images.len() > limit as usize {
    let next = &raw_images[limit as usize];

    Some(ImageCursor {
      created_at: format_datetime(next.created_at),
      id: next.id,
    })
  } else {
    None
  };

  let data = raw_images
    .into_iter()
    .filter_map(|raw| {
      if let Err(err) = ops::is_file_readable(&raw.path) {
        tracing::info!(
            path = %raw.path,
            error = ?err,
            "Skipping unreadable image"
        );
        return None;
      }
      Some(raw)
    })
    .take(limit as usize)
    .map(Image::from)
    .map(ImageDto::from)
    .collect();
  Ok(PaginatedImages { data, next_cursor })
}

// #[tracing::instrument]
// pub async fn list_images_grouped_by_hash(db: &Db) -> Result<Vec<Vec<Image>>, AppError> {
//   let image_files = image_repo::list_images_grouped_by_hash(db).await?;
//   let images = ImageFile::group_by_hash(image_files);
//   Ok(images)
// }
