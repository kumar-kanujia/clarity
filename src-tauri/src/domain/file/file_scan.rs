use std::path::PathBuf;

#[derive(Debug, Default)]
pub struct FileScanResult {
  pub files: Vec<PathBuf>,
  pub total_files: i64,
  pub walk_errors: i64,
}

impl FileScanResult {
  pub fn merge(&mut self, other: FileScanResult) {
    self.files.extend(other.files);
    self.total_files += other.total_files;
    self.walk_errors += other.walk_errors;
  }
}

#[derive(Debug)]
pub struct FileMetaData {
  pub path: String,
  pub size_bytes: i64,
  pub created_at: String,
}
