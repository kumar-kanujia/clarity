use std::io::Error;

use crate::infrastructure::fs::ops;

use tauri::{App, Manager};

use sqlx::{
  SqlitePool, migrate,
  sqlite::{SqliteConnectOptions, SqlitePoolOptions},
};

pub const DB_DIR: &str = "db";
pub const DB_FILE: &str = "clarity.db";

pub async fn setup_db(app: &App) -> Result<SqlitePool, Error> {
  log::info!("Setting up database");

  let app_data = app
    .path()
    .app_data_dir()
    .map_err(|err| Error::other(format!("Missing app data dir: {}", err)))?;

  let db_dir = app_data.join(DB_DIR);
  ops::ensure_dir(&db_dir)
    .map_err(|err| Error::other(format!("Failed to create DB dir: {}", err)))?;

  let db_path: std::path::PathBuf = db_dir.join(DB_FILE);

  let db_opts = SqliteConnectOptions::new()
    .filename(&db_path)
    .create_if_missing(true)
    .foreign_keys(true);

  let pool = SqlitePoolOptions::new()
    .max_connections(4)
    .acquire_timeout(std::time::Duration::from_secs(10))
    .after_connect(|conn, _| {
      Box::pin(async move {
        let pragmas = [
          "PRAGMA busy_timeout = 5000;",
          "PRAGMA temp_store = MEMORY;",
          "PRAGMA cache_size = -40000;", // ~40MB
          "PRAGMA wal_autocheckpoint = 1000;",
          "PRAGMA mmap_size = 268435456;", // 256MB
        ];

        for pragma in pragmas {
          sqlx::query(pragma).execute(&mut *conn).await?;
        }

        Ok(())
      })
    })
    .connect_with(db_opts)
    .await
    .map_err(|err| Error::other(format!("Failed to connect to DB: {}", err)))?;

  migrate!("./migrations")
    .run(&pool)
    .await
    .map_err(|err| Error::other(format!("Failed to migrate DB: {}", err)))?;

  sqlx::query("PRAGMA optimize;")
    .execute(&pool)
    .await
    .map_err(|err| Error::other(format!("DB optimization Error: {}", err)))?;

  log::info!("Database setup complete");

  Ok(pool)
}
