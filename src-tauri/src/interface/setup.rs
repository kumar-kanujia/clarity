use crate::infrastructure::fs::ops;

use tauri::{App, Manager};

use std::str::FromStr;

use sqlx::{
  SqlitePool, migrate,
  sqlite::{SqliteConnectOptions, SqlitePoolOptions},
};

pub async fn setup_db(app: &App) -> SqlitePool {
  println!("Setting up database");
  let mut app_data = app.path().app_data_dir().unwrap();

  app_data.push("db");

  let _ = ops::ensure_dir(&app_data);

  app_data.push("clarity.db");

  let db_path = app_data.to_str().unwrap();

  let db_opts: SqliteConnectOptions = SqliteConnectOptions::from_str(db_path)
    .unwrap()
    .create_if_missing(true)
    .foreign_keys(true);

  let db = SqlitePoolOptions::new()
    .max_connections(4) // small pool is best
    .acquire_timeout(std::time::Duration::from_secs(10))
    .after_connect(|conn, _meta| {
      Box::pin(async move {
        // Apply to every pooled connection
        sqlx::query("PRAGMA busy_timeout = 5000;")
          .execute(&mut *conn)
          .await?;
        sqlx::query("PRAGMA temp_store = MEMORY;")
          .execute(&mut *conn)
          .await?;
        sqlx::query("PRAGMA cache_size = -40000;")
          .execute(&mut *conn)
          .await?; // ~40MB
        sqlx::query("PRAGMA wal_autocheckpoint = 1000;")
          .execute(&mut *conn)
          .await?;
        sqlx::query("PRAGMA mmap_size = 268435456;")
          .execute(&mut *conn)
          .await?; // 256MB
        Ok::<_, sqlx::Error>(())
      })
    })
    .connect_with(db_opts)
    .await
    .expect("failed to connect sqlite");

  migrate!("./migrations").run(&db).await.expect("migrations");

  let _ = sqlx::query("PRAGMA optimize;").execute(&db).await;

  println!("Database setup complete");

  db
}
