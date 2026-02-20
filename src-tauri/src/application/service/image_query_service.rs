use crate::{
  application::error::AppError,
  infrastructure::{
    fs::ops, models::image_model::ImageItemRow, repo::image_repo::ImageRepository,
    utils::format_datetime,
  },
  interface::dtos::image_dto::{CreatedAtCursor, ImageItem, ImageItemResult},
};

#[derive(Debug)]
pub struct ImageQueryService {
  repo: ImageRepository,
}

impl ImageQueryService {
  pub fn new(repo: ImageRepository) -> Self {
    Self { repo }
  }

  fn split_for_pagination(
    &self,
    mut images: Vec<ImageItemRow>,
    limit: i64,
  ) -> (Option<CreatedAtCursor>, Vec<ImageItemRow>) {
    if images.len() > limit as usize {
      let next_item = images.pop().unwrap(); // Remove the 11th item
      let cursor = Some(CreatedAtCursor {
        created_at: format_datetime(next_item.created_at),
        id: next_item.id,
      });
      (cursor, images)
    } else {
      (None, images)
    }
  }

  fn filter_and_process_image(&self, images: Vec<ImageItemRow>) -> Vec<ImageItem> {
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
        Some(ImageItem::from(raw))
      })
      .collect()
  }

  pub async fn list_gallery_image_items(
    &self,
    limit: i64,
    cursor: Option<CreatedAtCursor>,
  ) -> Result<ImageItemResult, AppError> {
    let raw_images = self
      .repo
      .get_images_paginated(limit + 1, false, None, cursor)
      .await?;

    let (next_cursor, images_to_process) = self.split_for_pagination(raw_images, limit);

    let data = self.filter_and_process_image(images_to_process);

    Ok(ImageItemResult { data, next_cursor })
  }

  pub async fn list_bin_image_items(
    &self,
    limit: i64,
    cursor: Option<CreatedAtCursor>,
  ) -> Result<ImageItemResult, AppError> {
    let raw_images = self
      .repo
      .get_images_paginated(limit + 1, true, None, cursor)
      .await?;

    let (next_cursor, images_to_process) = self.split_for_pagination(raw_images, limit);

    let data = self.filter_and_process_image(images_to_process);

    Ok(ImageItemResult { data, next_cursor })
  }

  pub async fn list_favorite_image_items(
    &self,
    limit: i64,
    cursor: Option<CreatedAtCursor>,
  ) -> Result<ImageItemResult, AppError> {
    let raw_images = self
      .repo
      .get_images_paginated(limit + 1, false, Some(true), cursor)
      .await?;

    let (next_cursor, images_to_process) = self.split_for_pagination(raw_images, limit);

    let data = self.filter_and_process_image(images_to_process);

    Ok(ImageItemResult { data, next_cursor })
  }

  pub async fn list_taged_image_items(
    &self,
    tag_id: i64,
    limit: i64,
    cursor: Option<CreatedAtCursor>,
  ) -> Result<ImageItemResult, AppError> {
    let raw_images = self
      .repo
      .get_images_by_tag_paginated(tag_id, limit + 1, cursor)
      .await?;

    let (next_cursor, images_to_process) = self.split_for_pagination(raw_images, limit);

    let data = self.filter_and_process_image(images_to_process);

    Ok(ImageItemResult { data, next_cursor })
  }
}
