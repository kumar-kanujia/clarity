use std::{fs, str::FromStr};

use sqlx::{
  SqlitePool, migrate,
  sqlite::{SqliteConnectOptions, SqlitePoolOptions},
};
use tauri::{App, Manager};

pub async fn setup_db(app: &App) -> SqlitePool {
  println!("Setting up database");
  let mut app_data = app.path().app_data_dir().unwrap();
  app_data.push("db");
  if !app_data.exists() {
    fs::create_dir_all(app_data.clone()).unwrap();
  }

  app_data.push("clarity.db");

  let db_path = app_data.to_str().unwrap();

  let db_opts: SqliteConnectOptions = SqliteConnectOptions::from_str(db_path)
    .unwrap()
    .create_if_missing(true)
    .foreign_keys(true);

  let db = SqlitePoolOptions::new()
    .connect_with(db_opts)
    .await
    .unwrap();

  migrate!("./migrations").run(&db).await.unwrap();

  println!("Database initialized, path: {:?}", db_path);

  db
}
