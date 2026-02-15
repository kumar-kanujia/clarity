use crate::{
  domain::image::Image,
  error::AppError,
  infrastructure::{fs::ops, models::image_model::ImageModel, repo::image_repo},
  interface::dto::PaginatedImageHashGroups,
  setup::state::Db,
};

#[derive(Debug, Default)]
pub struct ImageGroupQueryService;

impl ImageGroupQueryService {
  #[tracing::instrument]
  pub async fn list_images_grouped_by_hash(
    &self,
    db: &Db,
    limit: i64,
    next_cursor: Option<Vec<u8>>,
  ) -> Result<PaginatedImageHashGroups, AppError> {
    let raw_images = image_repo::list_images_grouped_by_hash(db, limit, next_cursor).await?;
    let filtered_images = self.filter_image(raw_images);

    let next_cursor = filtered_images
      .last()
      .map(|image| image.content_hash.clone());

    let data = Image::group_by_hash(filtered_images);
    Ok(PaginatedImageHashGroups { data, next_cursor })
  }

  fn filter_image(&self, images: Vec<ImageModel>) -> Vec<Image> {
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
}
