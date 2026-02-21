use std::io;

use thiserror::Error;

#[derive(Debug, Error)]
pub enum DatabaseError {
  #[error("Database connection failed")]
  Connection {
    #[source]
    source: sqlx::Error,
  },

  #[error("IO error")]
  Io {
    #[source]
    source: io::Error,
  },

  #[error("Record already exists")]
  RecordAlreadyExists,

  #[error("Record not found")]
  NotFound,
}

impl From<sqlx::Error> for DatabaseError {
  fn from(value: sqlx::Error) -> Self {
    match value {
      sqlx::Error::Database(db_err)
        if matches!(db_err.code().as_deref(), Some("1555") | Some("2067")) =>
      {
        DatabaseError::RecordAlreadyExists
      }
      sqlx::Error::RowNotFound => DatabaseError::NotFound,
      sqlx::Error::Io(err) => DatabaseError::Io { source: err },
      _ => DatabaseError::Connection { source: value },
    }
  }
}
