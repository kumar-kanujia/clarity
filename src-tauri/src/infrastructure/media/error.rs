use thiserror::Error;

#[derive(Debug, Error)]
pub enum MetadataError {
  #[error("File not found: {0}")]
  NotFound(String),

  #[error("Permission denied: {0}")]
  PermissionDenied(String),

  #[error("IO error: {0}")]
  Io(String),

  #[error("Empty file: {0}")]
  EmptyFile(String),
}

#[derive(Debug, Error)]
pub enum ImageMetadataError {
  #[error("Thumbnail generation failed")]
  Thumbnail(#[from] ThumbnailError),
}

#[derive(Debug, Error)]
pub enum ThumbnailError {
  #[error("Failed to open image {path}: {source}")]
  Open {
    path: String,
    #[source]
    source: image::ImageError,
  },

  #[error("Failed to save thumbnail to {path}: {source}")]
  Save {
    path: String,
    #[source]
    source: image::ImageError,
  },
}
