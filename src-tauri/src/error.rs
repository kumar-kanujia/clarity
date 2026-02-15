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

impl AppError {
  pub fn user_message(&self) -> String {
    match self {
      AppError::Scan(err) => err.user_message(),
      AppError::Database(err) => err.user_message(),
      AppError::Join(_) => "Background task failed.".into(),
      AppError::Internal(_) => "Unexpected internal error.".into(),
    }
  }
}

pub fn user_friendly_message(err: &AppError) -> String {
  match err {
    AppError::Scan(_) => "Scan failed due to filesystem error.".into(),
    AppError::Join(_) => "Internal scan task failed.".into(),
    AppError::Database(db_err) => match db_err {
      DatabaseError::RecordAlreadyExists { .. } => "This item already exists.".into(),
      DatabaseError::Connection(_) => "Database connection failed.".into(),
    },
    AppError::Internal(_) => "Internal error.".into(),
  }
}
