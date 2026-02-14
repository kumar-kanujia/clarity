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
  let images = image_repo::list_images_paginated(db, limit + 1, cursor).await?;

  let next_cursor = if images.len() as i64 > limit
    && let Some(last) = images.last()
  {
    let created_at = format_datetime(last.created_at);
    Some(ImageCursor {
      created_at,
      id: last.id,
    })
  } else {
    None
  };

  let mut data: Vec<ImageDto> = images
    .into_iter()
    .map(Image::from)
    .filter_map(|image| match ops::is_file_readable(&image.path) {
      Err(err) => {
        tracing::info!("Unreadable image: {:?}", err);
        None
      }
      Ok(()) => Some(ImageDto::from(image)),
    })
    .collect();

  if data.len() == 0 {
    return Ok(PaginatedImages {
      data: Vec::new(),
      next_cursor: None,
    });
  }

  let has_next = data.len() as i64 > limit;

  if has_next {
    data.truncate(limit as usize);
  }

  Ok(PaginatedImages { data, next_cursor })
}

// #[tracing::instrument]
// pub async fn list_images_grouped_by_hash(db: &Db) -> Result<Vec<Vec<Image>>, AppError> {
//   let image_files = image_repo::list_images_grouped_by_hash(db).await?;
//   let images = ImageFile::group_by_hash(image_files);
//   Ok(images)
// }
