pub const DB_DIR: &str = "db";
pub const DB_LOCATION: &str = "clarity.sqlite3";
pub const MAX_DB_POOL_SIZE: u32 = 10;

// pub const MAX_WORKER_RETRIES: i64 = 3;
pub const MAX_PIPELINE_RETRIES: i64 = 3;

pub const FETCH_LIMIT: i64 = 12;
pub const TAG_TOP_FETCH_LIMIT: i64 = 5;

pub const THUMBNAIL_SIZE: u32 = 256;

pub const FILE_HASH_BATCH_FACTOR: usize = 4;
pub const THUMBNAIL_BATCH_FACTOR: usize = 1;
pub const DELETE_BATCH_FACTOR: usize = 4;
