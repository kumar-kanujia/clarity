use thiserror::Error;

#[derive(Debug, Error)]
pub enum DatabaseError {
  #[error("Connection error: {0}")]
  Connection(#[from] sqlx::Error),

  #[error("Record already exists: {0}")]
  RecordAlreadyExists(String),
}

impl DatabaseError {
  pub fn user_message(&self) -> String {
    match self {
      DatabaseError::RecordAlreadyExists(msg) => {
        format!("Record already exists: {0}", msg)
      }
      DatabaseError::Connection(_) => "Database connection failed.".into(),
    }
  }
}
