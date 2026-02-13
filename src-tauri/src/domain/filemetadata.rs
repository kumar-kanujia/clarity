use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct FileMetadata {
  pub file_path: String,
  pub file_size: u64,
  pub ctx: Option<u64>,
  pub mtx: Option<u64>,
}
