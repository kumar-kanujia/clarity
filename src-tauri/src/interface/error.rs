use crate::infrastructure::fs::error::FSError;

#[derive(Debug, thiserror::Error)]
pub enum DBInitError {
  #[error("Failed to resolve app data directory")]
  MissingAppDataDir,

  #[error("Failed to create database directory")]
  CreateDir(#[from] FSError),

  #[error("Failed to connect to database")]
  Connect(#[source] sqlx::Error),

  #[error("Database migration failed")]
  Migration(#[source] sqlx::migrate::MigrateError),

  #[error("Database optimization failed")]
  Optimize(#[source] sqlx::Error),
}
