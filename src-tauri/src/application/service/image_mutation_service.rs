use crate::{
  application::error::AppError, domain::file::FileMetaData,
  infrastructure::repo::image_repo::ImageRepository,
};

pub struct ImageMutationService {
  repo: ImageRepository,
}

impl ImageMutationService {
  pub fn new(repo: ImageRepository) -> Self {
    Self { repo }
  }

  #[tracing::instrument(skip(self))]
  pub async fn persist_file_metadata_for_images(
    &self,
    image_metadata: &[FileMetaData],
  ) -> Result<i64, AppError> {
    let imported = self
      .repo
      .create_images_by_file_metadata(image_metadata)
      .await?;

    Ok(imported as i64)
  }

  #[tracing::instrument(skip(self))]
  pub async fn change_image_is_favorite(&self, image_id: i64) -> Result<bool, AppError> {
    let is_favorite = self.repo.toggle_image_favorite(image_id).await?;
    Ok(is_favorite)
  }

  #[tracing::instrument(skip(self))]
  pub async fn change_image_is_deleted(
    &self,
    image_id: i64,
    is_deleted: bool,
  ) -> Result<(), AppError> {
    self
      .repo
      .set_image_deleted_status(image_id, is_deleted)
      .await?;
    Ok(())
  }
}
