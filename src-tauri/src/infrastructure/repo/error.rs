use thiserror::Error;

#[derive(Debug, Error)]
pub enum DatabaseError {
  #[error("Connection error: {0}")]
  Connection(#[from] sqlx::Error),

  #[error("Record already exists: {0}")]
  RecordAlreadyExists(String),

  #[error("Not found: {0}")]
  NotFound(String),
}

impl DatabaseError {
  pub fn user_message(&self) -> String {
    match self {
      Self::RecordAlreadyExists(msg) => {
        format!("Record already exists: {0}", msg)
      }
      Self::NotFound(msg) => {
        format!("Record not found: {0}", msg)
      }
      Self::Connection(_) => "Database connection failed.".into(),
    }
  }
}
