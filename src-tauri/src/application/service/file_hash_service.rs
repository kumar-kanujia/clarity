use crate::{domain::image::Image, infrastructure::processing::hashing};

use rayon::iter::{IntoParallelRefMutIterator, ParallelIterator};
use std::panic;

#[derive(Debug)]
pub struct FileHashService;

impl FileHashService {
  pub fn process_batch(files: &mut [Image]) {
    files
      .par_iter_mut()
      .for_each(|image| match Self::hash_file(image) {
        Ok(hash) => image.update_hash(hash),
        Err(err) => image.mark_hash_error(err),
      });
  }

  fn hash_file(image: &Image) -> Result<Vec<u8>, String> {
    panic::catch_unwind(|| hashing::generate_file_hash(&image.path, image.size_bytes))
      .map_err(|_| {
        tracing::error!(path=%image.path, id=image.id, "Hash panicked");
        "hash_file panicked".to_string()
      })?
      .map_err(|e| {
        tracing::error!(path=%image.path, id=image.id, error=%e);
        e.to_string()
      })
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::infrastructure::models::image_model::ImageStatus;
  use std::fs::File;
  use std::io::Write;
  use tempfile::tempdir;

  #[test]
  fn test_process_batch_empty() {
    let mut images: Vec<Image> = vec![];
    FileHashService::process_batch(&mut images);
    assert!(images.is_empty());
  }

  #[test]
  fn test_process_batch_with_valid_file() {
    let dir = tempdir().unwrap();
    let file_path = dir.path().join("test.jpg");
    let mut file = File::create(&file_path).unwrap();
    file.write_all(b"test image content").unwrap();
    drop(file);

    let mut images = vec![Image {
      id: 1,
      path: file_path.to_str().unwrap().to_string(),
      size_bytes: 18,
      status: ImageStatus::Pending,
      ..Default::default()
    }];

    FileHashService::process_batch(&mut images);

    assert_eq!(images[0].status, ImageStatus::Hashed);
    assert!(!images[0].content_hash.is_empty());
    assert_eq!(images[0].retry_count, 0);
    assert_eq!(images[0].error_message, None);
  }

  #[test]
  fn test_process_batch_with_nonexistent_file() {
    let mut images = vec![Image {
      id: 1,
      path: "/nonexistent/path/to/file.jpg".to_string(),
      size_bytes: 100,
      status: ImageStatus::Pending,
      ..Default::default()
    }];

    FileHashService::process_batch(&mut images);

    assert_eq!(images[0].status, ImageStatus::Pending);
    assert!(images[0].content_hash.is_empty());
    assert_eq!(images[0].retry_count, 1);
    assert!(images[0].error_message.is_some());
  }

  #[test]
  fn test_process_batch_multiple_files() {
    let dir = tempdir().unwrap();

    let file1_path = dir.path().join("test1.jpg");
    let mut file1 = File::create(&file1_path).unwrap();
    file1.write_all(b"content1").unwrap();
    drop(file1);

    let file2_path = dir.path().join("test2.jpg");
    let mut file2 = File::create(&file2_path).unwrap();
    file2.write_all(b"content2").unwrap();
    drop(file2);

    let mut images = vec![
      Image {
        id: 1,
        path: file1_path.to_str().unwrap().to_string(),
        size_bytes: 8,
        status: ImageStatus::Pending,
        ..Default::default()
      },
      Image {
        id: 2,
        path: file2_path.to_str().unwrap().to_string(),
        size_bytes: 8,
        status: ImageStatus::Pending,
        ..Default::default()
      },
    ];

    FileHashService::process_batch(&mut images);

    assert_eq!(images[0].status, ImageStatus::Hashed);
    assert_eq!(images[1].status, ImageStatus::Hashed);
    assert!(!images[0].content_hash.is_empty());
    assert!(!images[1].content_hash.is_empty());
    assert_ne!(images[0].content_hash, images[1].content_hash);
  }

  #[test]
  fn test_process_batch_same_content_same_hash() {
    let dir = tempdir().unwrap();

    let file1_path = dir.path().join("test1.jpg");
    let mut file1 = File::create(&file1_path).unwrap();
    file1.write_all(b"identical content").unwrap();
    drop(file1);

    let file2_path = dir.path().join("test2.jpg");
    let mut file2 = File::create(&file2_path).unwrap();
    file2.write_all(b"identical content").unwrap();
    drop(file2);

    let mut images = vec![
      Image {
        id: 1,
        path: file1_path.to_str().unwrap().to_string(),
        size_bytes: 17,
        status: ImageStatus::Pending,
        ..Default::default()
      },
      Image {
        id: 2,
        path: file2_path.to_str().unwrap().to_string(),
        size_bytes: 17,
        status: ImageStatus::Pending,
        ..Default::default()
      },
    ];

    FileHashService::process_batch(&mut images);

    assert_eq!(images[0].status, ImageStatus::Hashed);
    assert_eq!(images[1].status, ImageStatus::Hashed);
    assert_eq!(images[0].content_hash, images[1].content_hash);
  }

  #[test]
  fn test_process_batch_mixed_success_and_failure() {
    let dir = tempdir().unwrap();

    let valid_path = dir.path().join("valid.jpg");
    let mut file = File::create(&valid_path).unwrap();
    file.write_all(b"valid content").unwrap();
    drop(file);

    let mut images = vec![
      Image {
        id: 1,
        path: valid_path.to_str().unwrap().to_string(),
        size_bytes: 13,
        status: ImageStatus::Pending,
        ..Default::default()
      },
      Image {
        id: 2,
        path: "/nonexistent/file.jpg".to_string(),
        size_bytes: 100,
        status: ImageStatus::Pending,
        ..Default::default()
      },
    ];

    FileHashService::process_batch(&mut images);

    assert_eq!(images[0].status, ImageStatus::Hashed);
    assert!(!images[0].content_hash.is_empty());

    assert_eq!(images[1].status, ImageStatus::Pending);
    assert!(images[1].content_hash.is_empty());
    assert!(images[1].error_message.is_some());
  }

  #[test]
  fn test_process_batch_preserves_existing_retry_count() {
    let mut images = vec![Image {
      id: 1,
      path: "/nonexistent/file.jpg".to_string(),
      size_bytes: 100,
      status: ImageStatus::Pending,
      retry_count: 2,
      ..Default::default()
    }];

    FileHashService::process_batch(&mut images);

    assert_eq!(images[0].retry_count, 3);
  }
}