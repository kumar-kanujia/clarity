use crate::{
  application::error::AppError,
  domain::file::{FileMetaData, FileScanSummary},
  infrastructure::{fs::fs_scanner, processing::metadata},
};

use std::path::PathBuf;

pub async fn scan_paths_for_images(paths: &[String]) -> Result<FileScanSummary, AppError> {
  if paths.is_empty() {
    return Ok(FileScanSummary::default());
  }

  let paths_to_scan: Vec<PathBuf> = paths.iter().map(PathBuf::from).collect();

  let final_summary = tauri::async_runtime::spawn_blocking(move || {
    let mut summary = FileScanSummary::default();

    for path in paths_to_scan {
      match fs_scanner::scan_path_for_images(&path) {
        Ok(res) => summary.merge(res),
        Err(err) => {
          tracing::error!(
            error = ?err,
            path = path.display().to_string(),
            "Error occurred while scanning for images"
          );
          summary.walk_errors += 1;
        }
      }
    }

    summary
  })
  .await
  .map_err(|e| AppError::Internal { source: e })?;

  Ok(final_summary)
}

pub async fn extract_metadata_for_files(
  files: Vec<PathBuf>,
) -> Result<Vec<FileMetaData>, AppError> {
  // We wrap Rayon in spawn_blocking because Rayon blocks the thread it runs on
  let result = tauri::async_runtime::spawn_blocking(move || {
    use rayon::prelude::*; // Import parallel iterators

    files
      .into_par_iter()
      .filter_map(|file| match metadata::get_file_metadata(&file) {
        Ok(meta) => Some(meta),
        Err(err) => {
          tracing::warn!(error = ?err, "Metadata extraction failed");
          None
        }
      })
      .collect()
  })
  .await
  .map_err(|err| AppError::Internal { source: err })?;

  Ok(result)
}

#[cfg(test)]
mod tests {
  use super::*;
  use std::io::Write;

  #[tokio::test]
  async fn test_scan_paths_for_images_recursive() {
    let temp_dir = tempfile::tempdir().unwrap();
    let root = temp_dir.path();

    // Create a nested structure: root/a/1.jpg, root/b/2.png
    let dir_a = root.join("a");
    let dir_b = root.join("b");
    std::fs::create_dir(&dir_a).unwrap();
    std::fs::create_dir(&dir_b).unwrap();

    std::fs::File::create(dir_a.join("1.jpg")).unwrap();
    std::fs::File::create(dir_b.join("2.png")).unwrap();
    std::fs::File::create(root.join("not_an_image.txt")).unwrap();

    let paths_to_scan = vec![root.to_string_lossy().to_string()];

    let summary = scan_paths_for_images(&paths_to_scan).await.unwrap();

    // Assertions based on what your fs_scanner considers an image
    // Assuming .jpg and .png are included, and .txt is excluded
    assert_eq!(summary.total_files, 3);
    assert_eq!(summary.files.len(), 2);
    assert_eq!(summary.walk_errors, 0);
  }

  #[tokio::test]
  async fn test_extract_metadata_parallel() {
    let temp_dir = tempfile::tempdir().unwrap();
    let mut files = Vec::new();

    // Create 10 valid dummy files
    for i in 0..10 {
      let path = temp_dir.path().join(format!("file_{}.jpg", i));
      let mut f = std::fs::File::create(&path).unwrap();
      writeln!(f, "fake image data").unwrap();
      files.push(path);
    }

    // Add one non-existent path to test the filter_map/error handling
    files.push(temp_dir.path().join("ghost.jpg"));

    let metadata_results = extract_metadata_for_files(files).await.unwrap();

    // We created 10 valid files, the ghost file should have been filtered out
    assert_eq!(metadata_results.len(), 10);

    // Verify one of the entries
    assert!(
      metadata_results
        .iter()
        .any(|m| m.file_name.contains("file_0"))
    );
  }
}
