use crate::infrastructure::{fs::error::FSError, repo::error::DatabaseError};

use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
  #[error("File scan error: {0}")]
  Scan(#[from] FSError),

  #[error("Parllel join error: {0}")]
  Join(String),

  #[error("Database error: {0}")]
  Database(#[from] DatabaseError),

  #[error("Internal error: {0}")]
  Internal(#[from] tauri::Error),
}

impl Into<String> for AppError {
  fn into(self) -> String {
    match self {
      AppError::Scan(err) => err.user_message(),
      AppError::Database(err) => err.user_message(),
      AppError::Join(_) => "Background task failed.".into(),
      AppError::Internal(_) => "Unexpected internal error.".into(),
    }
  }
}
