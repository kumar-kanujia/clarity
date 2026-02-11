use crate::infrastructure::{fs::error::ScanError, repo::error::DatabaseError};

use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
  #[error("Scan error: {0}")]
  Scan(#[from] ScanError),

  #[error("Parllel join error: {0}")]
  Join(String),

  #[error("Thumbnail error: {0}")]
  Thumbnail(String),

  #[error("Database error: {0}")]
  Database(#[from] DatabaseError),
}

pub fn user_friendly_message(err: &AppError) -> String {
  match err {
    AppError::Join(_) => "Internal scan task failed.".into(),

    AppError::Scan(_) => "Scan failed due to filesystem error.".into(),

    AppError::Database(_) => "Database operation failed.".into(),

    AppError::Thumbnail(_) => "Thumbnail generation failed.".into(),
  }
}
