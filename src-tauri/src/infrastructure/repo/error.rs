use thiserror::Error;

#[derive(Debug, Error)]
pub enum DatabaseError {
  #[error("Connection error: {0}")]
  Connection(sqlx::Error),

  #[error("Record already exists: {record}")]
  RecordAlreadyExists {
    record: String,
    #[source]
    source: sqlx::Error,
  },
}

impl From<sqlx::Error> for DatabaseError {
  fn from(err: sqlx::Error) -> Self {
    if let sqlx::Error::Database(db_err) = &err {
      if matches!(db_err.code().as_deref(), Some("1555") | Some("2067")) {
        return DatabaseError::RecordAlreadyExists {
          record: db_err.message().to_string(),
          source: err,
        };
      }
    }

    DatabaseError::Connection(err)
  }
}

impl DatabaseError {
  pub fn user_message(&self) -> String {
    match self {
      DatabaseError::RecordAlreadyExists { record, .. } => {
        format!("{} already exists.", record)
      }
      DatabaseError::Connection(_) => "Database connection failed.".into(),
    }
  }
}
