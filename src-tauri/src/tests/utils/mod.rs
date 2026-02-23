#[cfg(test)]
use sqlx::{SqlitePool, sqlite::SqlitePoolOptions};

#[cfg(test)]
pub async fn setup_test_db() -> SqlitePool {
  // 1. Create an in-memory SQLite database
  let pool = SqlitePoolOptions::new()
    .max_connections(1) // SQLite memory DBs are connection-specific
    .connect("sqlite::memory:")
    .await
    .expect("Failed to create pool");

  // 2. Run migrations from your project's /migrations folder
  sqlx::migrate!("./migrations")
    .run(&pool)
    .await
    .expect("Failed to run migrations");

  pool
}
