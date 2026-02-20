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
