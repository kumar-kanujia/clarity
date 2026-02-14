use std::path::PathBuf;

pub struct FileScanResult {
  pub files: Vec<PathBuf>,
  pub total_files: i64,
  pub walk_errors: i64,
}
