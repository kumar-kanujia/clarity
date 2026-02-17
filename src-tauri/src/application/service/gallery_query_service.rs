use crate::{
  error::AppError,
  infrastructure::{
    fs::ops, models::image_model::GalleryImageRow, repo::image_repo::ImageRepository,
    system::format_datetime,
  },
  interface::dtos::image_dto::{GalleryImage, GalleryImageResult, ImageCursor},
};

#[derive(Debug)]
pub struct GalleryQueryService {
  repo: ImageRepository,
}

impl GalleryQueryService {
  pub fn new(repo: ImageRepository) -> Self {
    Self { repo }
  }

  #[tracing::instrument(skip(self))]
  pub async fn change_image_is_favorite(&self, image_id: i64) -> Result<bool, AppError> {
    let is_favorite = self.repo.update_image_is_favorite(image_id).await?;
    Ok(is_favorite)
  }

  #[tracing::instrument(skip(self))]
  pub async fn get_gallery_images(
    &self,
    limit: i64,
    cursor: Option<ImageCursor>,
  ) -> Result<GalleryImageResult, AppError> {
    let raw_images = self.repo.get_gallery_images(limit + 1, cursor).await?;

    let (next_cursor, images_to_process) = self.split_for_pagination(raw_images, limit);

    let data = self.filter_image(images_to_process);

    Ok(GalleryImageResult { data, next_cursor })
  }

  fn filter_image(&self, images: Vec<GalleryImageRow>) -> Vec<GalleryImage> {
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
        Some(GalleryImage::from(raw))
      })
      .collect()
  }

  fn split_for_pagination(
    &self,
    mut images: Vec<GalleryImageRow>,
    limit: i64,
  ) -> (Option<ImageCursor>, Vec<GalleryImageRow>) {
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
