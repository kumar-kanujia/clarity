use crate::{
  domain::file::file_scan::FileMetaData, error::AppError, infrastructure::repo::image_repo,
  setup::state::Db,
};

pub const CHUNK_SIZE: usize = 50;

pub struct ImageImportService;

impl ImageImportService {
  pub async fn persist_file_metadata_for_images(
    db: &Db,
    image_metadata: &[FileMetaData],
  ) -> Result<i64, AppError> {
    let mut imported = 0;
    for chunk in image_metadata.chunks(CHUNK_SIZE) {
      imported += image_repo::create_images_by_file_metadata(db, chunk).await? as i64;
    }
    Ok(imported)
  }
}
