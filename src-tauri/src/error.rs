use crate::infrastructure::{
  fs::error::{FileAccessError, ScanError},
  repo::error::DatabaseError,
};

use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
  #[error("Scan error: {0}")]
  Scan(#[from] ScanError),

  #[error("Parllel join error: {0}")]
  Join(String),

  #[error("Database error: {0}")]
  Database(#[from] DatabaseError),

  #[error("Internal error: {0}")]
  InternalError(String),

  #[error("File access error: {0}")]
  FileAccessError(#[from] FileAccessError),
}

pub fn user_friendly_message(err: &AppError) -> String {
  match err {
    AppError::Scan(_) => "Scan failed due to filesystem error.".into(),

    AppError::Join(_) => "Internal scan task failed.".into(),

    AppError::Database(_) => "Database operation failed.".into(),

    AppError::InternalError(_) => "Internal error.".into(),

    AppError::FileAccessError(_) => "File access error.".into(),
  }
}
