use crate::{
  domain::image::Image,
  error::AppError,
  infrastructure::{
    fs::ops, models::image_model::ImageModel, repo::image_repo, system::format_datetime,
  },
  interface::dto::{ImageCursor, ImageDto, PaginatedImages},
  setup::state::Db,
};

#[derive(Debug, Default)]
pub struct ImageQueryService;

impl ImageQueryService {
  #[tracing::instrument(skip(self, db))]
  pub async fn list_images_paginated(
    &self,
    db: &Db,
    limit: i64,
    cursor: Option<ImageCursor>,
  ) -> Result<PaginatedImages, AppError> {
    let raw_images = image_repo::list_images_paginated(db, limit + 1, cursor).await?;

    let (next_cursor, images_to_process) = self.split_for_pagination(raw_images, limit);

    let data = self.filter_image(images_to_process);

    Ok(PaginatedImages { data, next_cursor })
  }

  fn filter_image(&self, images: Vec<ImageModel>) -> Vec<ImageDto> {
    images
      .into_iter()
      .filter_map(|raw| {
        if let Err(err) = ops::is_file_readable(&raw.path) {
          tracing::warn!(
              path = %raw.path,
              error = ?err,
              "Skipping unreadable image"
          );
          return None;
        }
        Some(ImageDto::from(Image::from(raw)))
      })
      .collect()
  }

  fn split_for_pagination(
    &self,
    mut images: Vec<ImageModel>,
    limit: i64,
  ) -> (Option<ImageCursor>, Vec<ImageModel>) {
    if images.len() > limit as usize {
      let next_item = images.pop().unwrap(); // Remove the 11th item
      let cursor = Some(ImageCursor {
        created_at: format_datetime(next_item.created_at),
        id: next_item.id,
      });
      (cursor, images)
    } else {
      (None, images)
    }
  }
}
