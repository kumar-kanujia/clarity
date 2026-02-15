use crate::{
  application::{service::file_hash_service::FileHashService, worker::Worker},
  domain::image::Image,
  infrastructure::{
    models::image_model::ImageStatus,
    repo::{error::DatabaseError, image_repo::ImageRepository},
  },
};

#[derive(Debug, Clone)]
pub struct FileHashWorker {
  repo: &'static ImageRepository,
}

impl FileHashWorker {
  pub fn new(repo: &'static ImageRepository) -> Self {
    Self { repo }
  }
}

impl Worker for FileHashWorker {
  type Input = Image;
  type Output = Image;
  type Error = DatabaseError;

  fn name(&self) -> &'static str {
    "file_hash_worker"
  }

  fn batch_factor(&self) -> usize {
    4
  }

  async fn fetch_batch(&self, limit: i64) -> Result<Vec<Image>, DatabaseError> {
    let models = self
      .repo
      .list_images_by_status(limit, ImageStatus::Pending)
      .await?;
    Ok(models.into_iter().map(Image::from).collect())
  }

  fn process_batch(&self, mut items: Vec<Image>) -> Vec<Image> {
    FileHashService::process_batch(&mut items);
    items
  }

  async fn update_batch(&self, items: &[Image]) -> Result<u64, DatabaseError> {
    let count = self.repo.update_images_hash(items).await?;
    Ok(count)
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_worker_name() {
    let repo = Box::leak(Box::new(ImageRepository::new(
      sqlx::SqlitePool::connect_lazy(":memory:").unwrap(),
    )));
    let worker = FileHashWorker::new(repo);
    assert_eq!(worker.name(), "file_hash_worker");
  }

  #[test]
  fn test_worker_batch_factor() {
    let repo = Box::leak(Box::new(ImageRepository::new(
      sqlx::SqlitePool::connect_lazy(":memory:").unwrap(),
    )));
    let worker = FileHashWorker::new(repo);
    assert_eq!(worker.batch_factor(), 4);
  }

  #[test]
  fn test_get_batch_size() {
    let repo = Box::leak(Box::new(ImageRepository::new(
      sqlx::SqlitePool::connect_lazy(":memory:").unwrap(),
    )));
    let worker = FileHashWorker::new(repo);
    let batch_size = worker.get_batch_size();
    assert!(batch_size >= 4);
    assert!(batch_size <= num_cpus::get() as i64 * 4);
  }

  #[test]
  fn test_process_batch_empty() {
    let repo = Box::leak(Box::new(ImageRepository::new(
      sqlx::SqlitePool::connect_lazy(":memory:").unwrap(),
    )));
    let worker = FileHashWorker::new(repo);
    let items = vec![];
    let result = worker.process_batch(items);
    assert_eq!(result.len(), 0);
  }

  #[test]
  fn test_process_batch_transforms_images() {
    let repo = Box::leak(Box::new(ImageRepository::new(
      sqlx::SqlitePool::connect_lazy(":memory:").unwrap(),
    )));
    let worker = FileHashWorker::new(repo);

    let items = vec![
      Image {
        id: 1,
        path: "/nonexistent/test.jpg".to_string(),
        size_bytes: 100,
        status: ImageStatus::Pending,
        ..Default::default()
      },
    ];

    let result = worker.process_batch(items);
    assert_eq!(result.len(), 1);
    // Should have attempted to process and marked as error or hashed
    assert!(result[0].retry_count >= 1 || result[0].status == ImageStatus::Hashed);
  }

  #[test]
  fn test_worker_implements_clone() {
    let repo = Box::leak(Box::new(ImageRepository::new(
      sqlx::SqlitePool::connect_lazy(":memory:").unwrap(),
    )));
    let worker = FileHashWorker::new(repo);
    let _cloned = worker.clone();
  }
}