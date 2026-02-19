use std::path::PathBuf;

#[derive(Debug, Default)]
pub struct FileScanSummary {
  pub files: Vec<PathBuf>,
  pub total_files: i64,
  pub walk_errors: i64,
}

impl FileScanSummary {
  pub fn merge(&mut self, other: FileScanSummary) {
    self.files.extend(other.files);
    self.total_files += other.total_files;
    self.walk_errors += other.walk_errors;
  }
}

#[derive(Debug)]
pub struct FileMetaData {
  pub path: String,
  pub file_name: String,
  pub size_bytes: i64,
  pub created_at: String,
}
