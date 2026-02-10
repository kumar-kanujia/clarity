use crate::infrastructure::fs::ops;

use tauri::{App, Manager};

use sqlx::{
  SqlitePool, migrate,
  sqlite::{SqliteConnectOptions, SqlitePoolOptions},
};

pub const DB_DIR: &str = "db";
pub const DB_FILE: &str = "clarity.db";

pub async fn setup_db(app: &App) -> Result<SqlitePool, sqlx::Error> {
  println!("Setting up database");

  let app_data = app
    .path()
    .app_data_dir()
    .map_err(|_| sqlx::Error::Configuration("missing app data dir".into()))?;

  let db_dir = app_data.join(DB_DIR);
  ops::ensure_dir(&db_dir).map_err(|e| sqlx::Error::Configuration(e.to_string().into()))?;

  let db_path: std::path::PathBuf = db_dir.join(DB_FILE);

  let db_opts = SqliteConnectOptions::new()
    .filename(&db_path)
    .create_if_missing(true)
    .foreign_keys(true);

  let pool = SqlitePoolOptions::new()
    .max_connections(5)
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
    .await?;

  migrate!("./migrations").run(&pool).await?;

  sqlx::query("PRAGMA optimize;").execute(&pool).await?;

  println!("Database setup complete");

  Ok(pool)
}
