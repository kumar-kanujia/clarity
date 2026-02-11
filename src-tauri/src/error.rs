use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
  #[error("Scan error: {0}")]
  Scan(String),

  #[error("Metadata error: {0}")]
  Metadata(String),

  #[error("Thumbnail error: {0}")]
  Thumbnail(String),

  #[error("Database error: {0}")]
  Database(String),

  #[error("File missing: {0}")]
  FileMissing(String),

  #[error("Permission denied: {0}")]
  PermissionDenied(String),
}
