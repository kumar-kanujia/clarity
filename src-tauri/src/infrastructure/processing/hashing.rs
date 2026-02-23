use crate::infrastructure::processing::error::ProcessingError;

use std::{fs::File, io::BufReader, path::Path};

const PARALLEL_THRESHOLD_SIZE: i64 = 20 * 1024 * 1024;
const FILE_BUFFER_CAPACITY: usize = 128 * 1024;

pub fn generate_file_hash<P: AsRef<Path>>(
  path: P,
  file_size: i64,
) -> Result<Vec<u8>, ProcessingError> {
  let path_ref = path.as_ref();

  if file_size > PARALLEL_THRESHOLD_SIZE {
    let mut hasher = blake3::Hasher::new();
    if hasher.update_mmap_rayon(path_ref).is_ok() {
      return Ok(hasher.finalize().as_bytes().to_vec());
    }
  }

  let file = File::open(path_ref)?;
  let mut reader = BufReader::with_capacity(FILE_BUFFER_CAPACITY, file);
  let mut fallback_hasher = blake3::Hasher::new();

  std::io::copy(&mut reader, &mut fallback_hasher)?;

  Ok(fallback_hasher.finalize().as_bytes().to_vec())
}

#[cfg(test)]
mod tests {
  use super::*;
  use std::io::Write;
  use tempfile::NamedTempFile;

  // Helper to create a file of a specific size with dummy data
  fn create_test_file(size: usize) -> NamedTempFile {
    let mut file = NamedTempFile::new().unwrap();
    // Writing in chunks to avoid blowing up memory during test setup
    let chunk = vec![0u8; 1024 * 1024]; // 1MB chunk
    let mut written = 0;
    while written < size {
      let to_write = std::cmp::min(chunk.len(), size - written);
      file.write_all(&chunk[..to_write]).unwrap();
      written += to_write;
    }
    file.flush().unwrap();
    file
  }

  #[test]
  fn test_hash_small_file() -> Result<(), Box<dyn std::error::Error>> {
    let size = 1024; // 1KB
    let file = create_test_file(size);

    // Act
    let hash = generate_file_hash(file.path(), size as i64)?;

    // Assert
    assert_eq!(hash.len(), 32); // BLAKE3 default output is 32 bytes
    Ok(())
  }

  #[test]
  fn test_hash_at_threshold_boundary() -> Result<(), Box<dyn std::error::Error>> {
    // Test exactly the threshold to ensure the "else" (buffered) path works at the limit
    let size = PARALLEL_THRESHOLD_SIZE as usize;
    let file = create_test_file(size);

    let hash = generate_file_hash(file.path(), size as i64)?;
    assert_eq!(hash.len(), 32);
    Ok(())
  }

  #[test]
  fn test_hash_large_file_parallel() -> Result<(), Box<dyn std::error::Error>> {
    // Trigger the mmap_rayon branch
    let size = (PARALLEL_THRESHOLD_SIZE + 1024) as usize;
    let file = create_test_file(size);

    let hash = generate_file_hash(file.path(), size as i64)?;
    assert_eq!(hash.len(), 32);
    Ok(())
  }

  #[test]
  fn test_hash_consistency_fallback() -> Result<(), Box<dyn std::error::Error>> {
    // 1. Create a file with known content
    let content = b"Standardize this content across all hashing strategies.";
    let mut file = NamedTempFile::new()?;
    file.write_all(content)?;
    let path = file.path();
    let actual_size = content.len() as i64;

    // 2. Get hash via the small-file path (guaranteed fallback)
    let hash_small = generate_file_hash(path, actual_size)?;

    // 3. Get hash by "tricking" it to try mmap (but it will fail/fallback if it's too small for mmap_rayon)
    // or by providing a size larger than the threshold.
    let hash_forced = generate_file_hash(path, PARALLEL_THRESHOLD_SIZE + 1024)?;

    // 4. They must be identical
    assert_eq!(
      hash_small, hash_forced,
      "The fallback hash and parallel hash must match!"
    );
    Ok(())
  }

  #[test]
  fn test_empty_file_hash() -> Result<(), Box<dyn std::error::Error>> {
    let file = NamedTempFile::new()?;
    let hash = generate_file_hash(file.path(), 0)?;

    // BLAKE3 hash of an empty string is a specific known value
    assert_eq!(hash.len(), 32);
    assert_ne!(hash, vec![0u8; 32]); // Should not be all zeros
    Ok(())
  }

  #[test]
  fn test_hash_non_existent_file() {
    let result = generate_file_hash("definitely_not_a_file.txt", 100);
    assert!(result.is_err());
  }
}
