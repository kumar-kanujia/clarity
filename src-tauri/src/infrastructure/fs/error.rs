use thiserror::Error;

#[derive(Debug, Error)]
pub enum FSError {
  #[error("Invalid root path: {0}")]
  InvalidRoot(String),

  #[error("IO error: {0}")]
  Io(#[from] std::io::Error),

  #[error("Permission denied: {0}")]
  PermissionDenied(String),

  #[error("File not found: {0}")]
  FileNotFound(String),
}
