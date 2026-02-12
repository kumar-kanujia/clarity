use thiserror::Error;

#[derive(Debug, Error)]
pub enum ScanError {
  #[error("Invalid root path: {0}")]
  InvalidRoot(String),

  #[error("IO error during directory walk: {0}")]
  Io(#[from] std::io::Error),
}

#[derive(Debug, Error)]
pub enum FileAccessError {
  #[error("Permission denied: {0}")]
  PermissionDenied(String),
  
  #[error("File not found: {0}")]
  FileNotFound(String),

  #[error("IO error: {0}")]
  Io(#[from] std::io::Error),
}
