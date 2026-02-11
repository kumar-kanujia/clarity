use sqlx::{Pool, Sqlite};

pub type Db = Pool<Sqlite>;

pub static IMAGE_DIR: &str = "images";

/// Thumbnail size in pixels
pub const THUMBNAIL_SIZE: u32 = 256;

/// Batch size for image save operations
pub const CHUNK_SIZE: usize = 50;

pub struct AppState {
  pub db: Db,
}
