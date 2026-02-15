use crate::{
  domain::file::file_scan::FileMetaData,
  infrastructure::{processing::error::ProcessingError, system::get_utc_timestamp},
};

use std::{
  fs::{self, Metadata},
  path::Path,
  time::{self},
};

pub struct MetadataP;

impl MetadataP {
  fn get_metadata(file: &Path) -> Result<Metadata, ProcessingError> {
    fs::metadata(file).map_err(|e| match e.kind() {
      std::io::ErrorKind::NotFound => ProcessingError::NotFound(file.display().to_string()),
      std::io::ErrorKind::PermissionDenied => {
        ProcessingError::PermissionDenied(file.display().to_string())
      }
      _ => ProcessingError::Io(e),
    })
  }

  fn extract_created_at(metadata: Metadata) -> String {
    let system_time = metadata
      .created()
      .or_else(|_| metadata.modified())
      .unwrap_or(time::SystemTime::now());
    get_utc_timestamp(system_time)
  }

  pub fn get_file_metadata(file: &Path) -> Result<FileMetaData, ProcessingError> {
    let metadata = Self::get_metadata(file)?;
    let path = file.to_string_lossy().to_string();
    let size_bytes = metadata.len() as i64;
    if size_bytes == 0 {
      return Err(ProcessingError::EmptyFile(path));
    }
    let created_at = Self::extract_created_at(metadata);
    Ok(FileMetaData {
      path,
      size_bytes,
      created_at,
    })
  }
}
