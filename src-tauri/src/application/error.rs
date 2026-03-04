use std::any::Any;

use crate::infrastructure::{
  fs::error::FSError, processing::error::ProcessingError, repo::error::DatabaseError,
};

use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
  #[error("Filesystem error")]
  Filesystem {
    #[from]
    source: FSError,
  },

  #[error("{0}")]
  Validation(String),

  #[error("Database error")]
  Database {
    #[from]
    source: DatabaseError,
  },

  #[error("Image processing error")]
  Processing {
    #[from]
    source: ProcessingError,
  },

  #[error("Background task failed")]
  Join {
    #[from]
    source: tokio::task::JoinError,
  },

  #[error("Internal error")]
  Internal {
    #[from]
    source: tauri::Error,
  },

  #[error("Unknown error: {0}")]
  Unknown(String),
}

pub fn extract_panic_message(payload: &Box<dyn Any + Send>) -> String {
  if let Some(s) = payload.downcast_ref::<&str>() {
    s.to_string()
  } else if let Some(s) = payload.downcast_ref::<String>() {
    s.clone()
  } else {
    "Unknown panic payload".to_string()
  }
}
