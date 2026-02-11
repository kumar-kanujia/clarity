use thiserror::Error;

#[derive(Debug, Error)]
pub enum ScanError {
  #[error("Invalid root path: {0}")]
  InvalidRoot(String),

  #[error("IO error during directory walk: {0}")]
  Io(#[from] std::io::Error),
}
