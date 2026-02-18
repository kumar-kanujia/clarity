use thiserror::Error;

#[derive(Debug, Error)]
pub enum DatabaseError {
  #[error("Connection error: {0}")]
  Connection(String),

  #[error("Record already exists: {0}")]
  RecordAlreadyExists(String),

  #[error("Record not found: {0}")]
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

impl From<sqlx::Error> for DatabaseError {
  fn from(value: sqlx::Error) -> Self {
    match &value {
      sqlx::Error::Database(db_err)
        if matches!(db_err.code().as_deref(), Some("1555") | Some("2067")) =>
      {
        DatabaseError::RecordAlreadyExists(
          "Record with the same unique field already exists.".to_string(),
        )
      }
      sqlx::Error::RowNotFound => {
        DatabaseError::NotFound("Requested record was not found.".to_string())
      }
      _ => DatabaseError::Connection(value.to_string()),
    }
  }
}
