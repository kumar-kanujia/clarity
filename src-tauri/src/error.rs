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

pub fn user_friendly_message(err: &AppError) -> String {
  match err {
    AppError::Scan(_) => "Scan failed due to filesystem error.".into(),

    AppError::Join(_) => "Internal scan task failed.".into(),

    AppError::Database(_) => "Database operation failed.".into(),

    AppError::Internal(_) => "Internal error.".into(),
  }
}
