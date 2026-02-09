use sqlx::{Pool, Sqlite};

pub type Db = Pool<Sqlite>;

pub static IMAGE_DIR: &str = "images";

pub struct AppState {
  pub db: Db,
}
