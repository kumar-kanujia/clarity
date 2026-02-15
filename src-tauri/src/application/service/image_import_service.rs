use crate::{
  domain::file::FileMetaData, error::AppError, infrastructure::repo::image_repo::ImageRepository,
};

pub const CHUNK_SIZE: usize = 50;

pub struct ImageImportService {
  repo: ImageRepository,
}

impl ImageImportService {
  pub fn new(repo: ImageRepository) -> Self {
    Self { repo }
  }

  pub async fn persist_file_metadata_for_images(
    &self,
    image_metadata: &[FileMetaData],
  ) -> Result<i64, AppError> {
    let mut imported = 0;

    for chunk in image_metadata.chunks(CHUNK_SIZE) {
      imported += self.repo.create_images_by_file_metadata(chunk).await? as i64;
    }

    Ok(imported)
  }
}
