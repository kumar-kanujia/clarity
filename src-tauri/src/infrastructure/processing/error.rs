use thiserror::Error;

#[derive(Debug, Error)]
pub enum ProcessingError {
  #[error("File not found: {0}")]
  NotFound(String),

  #[error("Permission denied: {0}")]
  PermissionDenied(String),

  #[error("Empty file: {0}")]
  EmptyFile(String),

  #[error("IO error: {0}")]
  Io(#[from] std::io::Error),

  #[error("Failed to open image {path}: {source}")]
  OpenImage {
    path: String,
    #[source]
    source: image::ImageError,
  },

  #[error("Failed to save image to {path}: {source}")]
  SaveImage {
    path: String,
    #[source]
    source: image::ImageError,
  },
}
