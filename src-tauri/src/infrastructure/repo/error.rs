use thiserror::Error;

#[derive(Debug, Error)]
pub enum DatabaseError {
  #[error("Connection error: {0}")]
  Connection(#[from] sqlx::Error),
}
