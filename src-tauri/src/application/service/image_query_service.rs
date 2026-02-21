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
      let next_item = images.pop().unwrap();
      let cursor = Some(CreatedAtCursor {
        created_at: format_datetime(next_item.created_at),
        id: next_item.id,
      });
      (cursor, images)
    } else {
      (None, images)
    }
  }

  async fn filter_and_process_image(
    &self,
    images: Vec<ImageItemRow>,
  ) -> Result<Vec<ImageItem>, AppError> {
    let processed = tokio::task::spawn_blocking(move || {
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
    })
    .await
    .map_err(|e| AppError::Join { source: e })?;

    Ok(processed)
  }

  pub async fn list_image_items(
    &self,
    limit: i64,
    cursor: Option<CreatedAtCursor>,
    is_deleted: bool,
    is_favorite: Option<bool>,
  ) -> Result<ImageItemResult, AppError> {
    let raw_images = self
      .repo
      .get_images_paginated(cursor, limit + 1, is_deleted, is_favorite)
      .await?;

    let (next_cursor, images_to_process) = self.split_for_pagination(raw_images, limit);

    let data = self.filter_and_process_image(images_to_process).await?;

    Ok(ImageItemResult { data, next_cursor })
  }

  pub async fn list_tagged_image_items(
    &self,
    tag_id: i64,
    limit: i64,
    cursor: Option<CreatedAtCursor>,
  ) -> Result<ImageItemResult, AppError> {
    let raw_images = self
      .repo
      .get_images_by_tag_paginated(cursor, limit + 1, tag_id)
      .await?;

    let (next_cursor, images_to_process) = self.split_for_pagination(raw_images, limit);

    let data = self.filter_and_process_image(images_to_process).await?;

    Ok(ImageItemResult { data, next_cursor })
  }
}
