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

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_chunk_size_constant() {
    assert_eq!(CHUNK_SIZE, 50);
  }

  #[test]
  fn test_chunks_logic_small_dataset() {
    let metadata: Vec<FileMetaData> = (0..10)
      .map(|i| FileMetaData {
        path: format!("/path/to/file{}.jpg", i),
        size_bytes: 1000,
        created_at: "2024-01-01".to_string(),
      })
      .collect();

    let chunks: Vec<_> = metadata.chunks(CHUNK_SIZE).collect();
    assert_eq!(chunks.len(), 1);
    assert_eq!(chunks[0].len(), 10);
  }

  #[test]
  fn test_chunks_logic_exact_chunk_size() {
    let metadata: Vec<FileMetaData> = (0..50)
      .map(|i| FileMetaData {
        path: format!("/path/to/file{}.jpg", i),
        size_bytes: 1000,
        created_at: "2024-01-01".to_string(),
      })
      .collect();

    let chunks: Vec<_> = metadata.chunks(CHUNK_SIZE).collect();
    assert_eq!(chunks.len(), 1);
    assert_eq!(chunks[0].len(), 50);
  }

  #[test]
  fn test_chunks_logic_multiple_chunks() {
    let metadata: Vec<FileMetaData> = (0..120)
      .map(|i| FileMetaData {
        path: format!("/path/to/file{}.jpg", i),
        size_bytes: 1000,
        created_at: "2024-01-01".to_string(),
      })
      .collect();

    let chunks: Vec<_> = metadata.chunks(CHUNK_SIZE).collect();
    assert_eq!(chunks.len(), 3);
    assert_eq!(chunks[0].len(), 50);
    assert_eq!(chunks[1].len(), 50);
    assert_eq!(chunks[2].len(), 20);
  }

  #[test]
  fn test_chunks_logic_empty_dataset() {
    let metadata: Vec<FileMetaData> = vec![];
    let chunks: Vec<_> = metadata.chunks(CHUNK_SIZE).collect();
    assert_eq!(chunks.len(), 0);
  }

  #[test]
  fn test_chunks_logic_boundary_plus_one() {
    let metadata: Vec<FileMetaData> = (0..51)
      .map(|i| FileMetaData {
        path: format!("/path/to/file{}.jpg", i),
        size_bytes: 1000,
        created_at: "2024-01-01".to_string(),
      })
      .collect();

    let chunks: Vec<_> = metadata.chunks(CHUNK_SIZE).collect();
    assert_eq!(chunks.len(), 2);
    assert_eq!(chunks[0].len(), 50);
    assert_eq!(chunks[1].len(), 1);
  }
}