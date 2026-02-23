use crate::{
  domain::file::FileMetaData,
  infrastructure::{processing::error::ProcessingError, utils::get_utc_timestamp},
};

use std::{
  fs::{self, Metadata},
  path::Path,
  time::SystemTime,
};

fn get_metadata(file: &Path) -> Result<Metadata, ProcessingError> {
  fs::metadata(file).map_err(|e| match e.kind() {
    std::io::ErrorKind::NotFound => ProcessingError::NotFound(file.display().to_string()),
    std::io::ErrorKind::PermissionDenied => {
      ProcessingError::PermissionDenied(file.display().to_string())
    }
    _ => ProcessingError::Io(e),
  })
}

fn extract_created_at(metadata: &Metadata) -> String {
  let system_time = metadata
    .created()
    .or_else(|_| metadata.modified())
    .unwrap_or_else(|_| SystemTime::now());

  get_utc_timestamp(system_time)
}

pub fn get_file_metadata(file: &Path) -> Result<FileMetaData, ProcessingError> {
  let metadata = get_metadata(file)?;

  let size_bytes = metadata.len() as i64;

  let file_name = file
    .file_name()
    .map(|n| n.to_string_lossy().into_owned())
    .unwrap_or_else(|| "unknown".to_string());

  if size_bytes == 0 {
    return Err(ProcessingError::EmptyFile(file_name));
  }

  let path = file.to_string_lossy().into_owned();

  let created_at = extract_created_at(&metadata);

  Ok(FileMetaData {
    file_name,
    path,
    size_bytes,
    created_at,
  })
}

#[cfg(test)]
mod tests {
  use super::*;
  use std::fs::File;
  use std::io::Write;
  use tempfile::tempdir;

  #[test]
  fn test_get_file_metadata_success() -> Result<(), Box<dyn std::error::Error>> {
    let dir = tempdir()?;
    let file_path = dir.path().join("test_image.jpg");

    // Create a file with specific content to check size
    let mut file = File::create(&file_path)?;
    let content = b"fake-image-data";
    file.write_all(content)?;
    file.sync_all()?; // Ensure metadata is updated on disk

    // Act
    let meta = get_file_metadata(&file_path)?;

    // Assert
    assert_eq!(meta.file_name, "test_image.jpg");
    assert_eq!(meta.size_bytes, content.len() as i64);
    assert!(meta.path.contains("test_image.jpg"));
    // Check if timestamp looks like a UTC string (simple regex or length check)
    assert!(!meta.created_at.is_empty());

    Ok(())
  }

  #[test]
  fn test_get_file_metadata_empty_file_error() -> Result<(), Box<dyn std::error::Error>> {
    let dir = tempdir()?;
    let file_path = dir.path().join("empty.jpg");
    File::create(&file_path)?; // Create empty file

    // Act
    let result = get_file_metadata(&file_path);

    // Assert
    match result {
      Err(ProcessingError::EmptyFile(name)) => assert_eq!(name, "empty.jpg"),
      _ => panic!("Expected EmptyFile error, got {:?}", result),
    }
    Ok(())
  }

  #[test]
  fn test_get_metadata_not_found() {
    let path = Path::new("does_not_exist_anywhere_ever.png");
    let result = get_metadata(path);

    match result {
      Err(ProcessingError::NotFound(p)) => assert!(p.contains("does_not_exist")),
      _ => panic!("Expected NotFound error, got {:?}", result),
    }
  }

  #[test]
  fn test_extract_created_at_fallback() -> Result<(), Box<dyn std::error::Error>> {
    let dir = tempdir()?;
    let file_path = dir.path().join("time_test.txt");
    File::create(&file_path)?;

    let metadata = std::fs::metadata(&file_path)?;
    let timestamp = extract_created_at(&metadata);

    // Since we can't easily "delete" creation time from a real filesystem for testing,
    // we verify that it returns a non-empty string which implies the unwrap_or_else
    // logic is safe.
    assert!(!timestamp.is_empty());
    Ok(())
  }
}
