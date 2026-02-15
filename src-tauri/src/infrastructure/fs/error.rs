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

impl FSError {
  pub fn user_message(&self) -> String {
    match self {
      FSError::FileNotFound(_) => "Requested file was not found.".into(),
      FSError::InvalidRoot(_) => "Invalid root path.".into(),
      FSError::PermissionDenied(_) => "Permission denied while accessing files.".into(),
      _ => "Filesystem operation failed.".into(),
    }
  }
}
