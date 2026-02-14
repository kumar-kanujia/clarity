use crate::{
  application::{services::file_hash_service::FileHashService, workers::Worker},
  domain::image::Image,
  infrastructure::{
    models::image_model::ImageStatus,
    repo::{error::DatabaseError, image_repo},
  },
  setup::state::Db,
};

#[derive(Debug, Default, Clone)]
pub struct FileHashWorker;

impl Worker for FileHashWorker {
  fn name(&self) -> &'static str {
    "file_hash_worker"
  }

  fn batch_factor(&self) -> usize {
    4
  }

  async fn fetch_batch(&self, db: &Db, limit: i64) -> Result<Vec<Image>, DatabaseError> {
    let models = image_repo::list_images_by_status(db, limit, ImageStatus::Pending).await?;
    Ok(models.into_iter().map(Image::from).collect())
  }

  fn process_batch(&self, mut items: Vec<Image>) -> Vec<Image> {
    FileHashService::process_batch(&mut items);
    items
  }

  async fn update_batch(&self, db: &Db, items: &Vec<Image>) -> Result<u64, DatabaseError> {
    let count = image_repo::update_images_hash(db, items).await?;
    Ok(count)
  }
}
