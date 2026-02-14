use std::path::PathBuf;

#[derive(Debug)]
pub struct FileScanResult {
  pub files: Vec<PathBuf>,
  pub total_files: i64,
  pub walk_errors: i64,
}

#[derive(Debug)]
pub struct FileMetaData {
  pub path: String,
  pub size_bytes: i64,
  pub created_at: String,
}
