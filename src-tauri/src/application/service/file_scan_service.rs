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
