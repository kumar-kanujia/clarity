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

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_file_scan_result_default() {
    let result = FileScanResult::default();
    assert!(result.files.is_empty());
    assert_eq!(result.total_files, 0);
    assert_eq!(result.walk_errors, 0);
  }

  #[test]
  fn test_file_scan_result_merge_empty() {
    let mut result1 = FileScanResult::default();
    let result2 = FileScanResult::default();

    result1.merge(result2);

    assert!(result1.files.is_empty());
    assert_eq!(result1.total_files, 0);
    assert_eq!(result1.walk_errors, 0);
  }

  #[test]
  fn test_file_scan_result_merge() {
    let mut result1 = FileScanResult {
      files: vec![PathBuf::from("/path1")],
      total_files: 10,
      walk_errors: 1,
    };

    let result2 = FileScanResult {
      files: vec![PathBuf::from("/path2"), PathBuf::from("/path3")],
      total_files: 20,
      walk_errors: 2,
    };

    result1.merge(result2);

    assert_eq!(result1.files.len(), 3);
    assert_eq!(result1.total_files, 30);
    assert_eq!(result1.walk_errors, 3);
  }

  #[test]
  fn test_file_scan_result_merge_preserves_files() {
    let mut result1 = FileScanResult {
      files: vec![PathBuf::from("/first")],
      total_files: 1,
      walk_errors: 0,
    };

    let result2 = FileScanResult {
      files: vec![PathBuf::from("/second")],
      total_files: 1,
      walk_errors: 0,
    };

    result1.merge(result2);

    assert_eq!(result1.files[0], PathBuf::from("/first"));
    assert_eq!(result1.files[1], PathBuf::from("/second"));
  }

  #[test]
  fn test_file_scan_result_merge_multiple_times() {
    let mut result = FileScanResult::default();

    result.merge(FileScanResult {
      files: vec![PathBuf::from("/a")],
      total_files: 5,
      walk_errors: 1,
    });

    result.merge(FileScanResult {
      files: vec![PathBuf::from("/b")],
      total_files: 10,
      walk_errors: 2,
    });

    result.merge(FileScanResult {
      files: vec![PathBuf::from("/c")],
      total_files: 15,
      walk_errors: 3,
    });

    assert_eq!(result.files.len(), 3);
    assert_eq!(result.total_files, 30);
    assert_eq!(result.walk_errors, 6);
  }
}