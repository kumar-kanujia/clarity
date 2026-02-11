use sqlx::{Pool, Sqlite};

pub type Db = Pool<Sqlite>;

pub static IMAGE_DIR: &str = "images";

pub const THUMBNAIL_SIZE: u32 = 256;

pub struct AppState {
  pub db: Db,
}
