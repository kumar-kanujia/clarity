use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct ImageMetadata {
  pub thumbnail_path: String,
  pub width: i64,
  pub height: i64,
}
