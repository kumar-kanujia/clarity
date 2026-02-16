use crate::{
  domain::image::Image,
  error::AppError,
  infrastructure::{
    fs::ops, models::image_model::ImageRow, repo::image_repo::ImageRepository,
    system::format_datetime,
  },
  interface::dto::{ImageCursor, ImageDto, PaginatedImageHashGroups, PaginatedImages},
  state::Db,
};

#[derive(Debug)]
pub struct ImageQueryService {
  repo: ImageRepository,
}

impl ImageQueryService {
  pub fn new(db: Db) -> Self {
    Self {
      repo: ImageRepository::new(db),
    }
  }

  #[tracing::instrument]
  pub async fn list_images_grouped_by_hash(
    &self,
    limit: i64,
    next_cursor: Option<i64>,
  ) -> Result<PaginatedImageHashGroups, AppError> {
    let raw_images = self
      .repo
      .list_images_grouped_by_hash(limit, next_cursor)
      .await?;

    let filtered_images = self.filter_image(raw_images);

    let id = filtered_images.last().map(|i| i.id);

    let data = Image::group_by_hash(filtered_images);

    let next_cursor = if data.len() == limit as usize {
      id
    } else {
      None
    };

    Ok(PaginatedImageHashGroups { data, next_cursor })
  }

  #[tracing::instrument(skip(self))]
  pub async fn list_images_with_tag_paginated(
    &self,
    tag_id: i64,
    limit: i64,
    cursor: Option<ImageCursor>,
  ) -> Result<PaginatedImages, AppError> {
    let raw_images = self
      .repo
      .list_images_with_tag_id_paginated(tag_id, limit + 1, cursor)
      .await?;

    let (next_cursor, images_to_process) = self.split_for_pagination(raw_images, limit);

    let data = self
      .filter_image(images_to_process)
      .into_iter()
      .map(ImageDto::from)
      .collect();

    Ok(PaginatedImages { data, next_cursor })
  }

  #[tracing::instrument(skip(self))]
  pub async fn list_images_paginated(
    &self,
    limit: i64,
    cursor: Option<ImageCursor>,
  ) -> Result<PaginatedImages, AppError> {
    let raw_images = self.repo.list_images_paginated(limit + 1, cursor).await?;

    let (next_cursor, images_to_process) = self.split_for_pagination(raw_images, limit);

    let data = self
      .filter_image(images_to_process)
      .into_iter()
      .map(ImageDto::from)
      .collect();

    Ok(PaginatedImages { data, next_cursor })
  }

  fn filter_image(&self, images: Vec<ImageRow>) -> Vec<Image> {
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
        Some(Image::from(raw))
      })
      .collect()
  }

  fn split_for_pagination(
    &self,
    mut images: Vec<ImageRow>,
    limit: i64,
  ) -> (Option<ImageCursor>, Vec<ImageRow>) {
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
