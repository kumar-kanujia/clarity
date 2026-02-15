use crate::{
  domain::image::Image,
  error::AppError,
  infrastructure::{fs::ops, models::image_model::ImageModel, repo::image_repo::ImageRepository},
  interface::dto::PaginatedImageHashGroups,
  setup::state::Db,
};

#[derive(Debug)]
pub struct ImageGroupQueryService {
  repo: ImageRepository,
}

impl ImageGroupQueryService {
  pub fn new(db: &Db) -> Self {
    Self {
      repo: ImageRepository::new(db.clone()),
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
