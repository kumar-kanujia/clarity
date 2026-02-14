use std::path::PathBuf;

use tauri::AppHandle;

use crate::{
  application::{services::thumbnail_service::ThumbnailService, workers::Worker},
  domain::image::Image,
  infrastructure::{
    models::image_model::ImageStatus,
    repo::{error::DatabaseError, image_repo},
  },
  setup::state::Db,
};

#[derive(Debug, Clone)]
pub struct ThumbnailWorker {
  pub thumbnail_target: PathBuf,
}

impl ThumbnailWorker {
  pub fn new(app: &AppHandle) -> Option<Self> {
    match ThumbnailService::get_thumbnail_target(app) {
      Ok(path) => Some(Self {
        thumbnail_target: path,
      }),
      Err(e) => {
        tracing::error!(error = ?e, "Thumbnail worker failed to lock cache directory");
        None
      }
    }
  }
}

impl Worker for ThumbnailWorker {
  fn name(&self) -> &'static str {
    "thumbnail_worker"
  }

  fn batch_factor(&self) -> usize {
    2
  }

  async fn fetch_batch(&self, db: &Db, limit: i64) -> Result<Vec<Image>, DatabaseError> {
    let models = image_repo::list_images_by_status(db, limit, ImageStatus::Hashed).await?;
    Ok(models.into_iter().map(Image::from).collect())
  }

  fn process_batch(&self, mut items: Vec<Image>) -> Vec<Image> {
    ThumbnailService::process_batch(&mut items, &self.thumbnail_target);
    items
  }

  async fn update_batch(&self, db: &Db, items: &Vec<Image>) -> Result<u64, DatabaseError> {
    let count = image_repo::update_images_metadata(db, items).await?;
    Ok(count)
  }
}
