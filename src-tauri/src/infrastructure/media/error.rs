use thiserror::Error;

#[derive(Debug, Error)]
pub enum MetadataError {
  #[error("File not found: {0}")]
  NotFound(String),

  #[error("Permission denied: {0}")]
  PermissionDenied(String),

  #[error("IO error: {0}")]
  Io(String),
}
