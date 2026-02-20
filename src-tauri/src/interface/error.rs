use serde::Serialize;
use thiserror::Error;

use crate::application::error::AppError;

#[derive(Debug, Error, Serialize)]
#[serde(tag = "type", content = "message")]
pub enum CommandError {
  #[error("{message}")]
  User { message: String },

  #[error("Internal error")]
  Internal,
}

impl From<AppError> for CommandError {
  fn from(err: AppError) -> Self {
    tracing::error!(
        error = ?err,
        "Command failed"
    );
    match err {
      AppError::Filesystem { source } => CommandError::User {
        message: source.to_string(),
      },

      AppError::Database { source } => CommandError::User {
        message: source.to_string(),
      },

      AppError::Processing { source } => CommandError::User {
        message: source.to_string(),
      },

      AppError::Join { .. } => CommandError::Internal,

      AppError::Internal { .. } => CommandError::Internal,

      AppError::Unknown { .. } => CommandError::Internal,
    }
  }
}
