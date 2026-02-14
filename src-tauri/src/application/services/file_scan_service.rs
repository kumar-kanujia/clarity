use std::path::PathBuf;

use tokio::task::JoinSet;

use crate::{
  domain::file::file_scan::{FileMetaData, FileScanResult},
  error::AppError,
  infrastructure::{fs::fs_scanner::FileScanner, processing::metadata::MetadataP},
};

pub struct FileScanService;

impl FileScanService {
  pub async fn scan_for_images(paths: &[String]) -> Result<FileScanResult, AppError> {
    let mut scan_set = JoinSet::new();

    for path in paths {
      let path = PathBuf::from(path);
      scan_set.spawn_blocking(move || FileScanner::scan_path_for_images(&path));
    }

    let mut files = Vec::new();

    let mut total_files = 0;
    let mut walk_errors = 0;

    while let Some(search) = scan_set.join_next().await {
      let scan_result = search
        .map_err(|e| AppError::Join(e.to_string()))?
        .map_err(AppError::from)?;
      total_files += scan_result.total_files;
      walk_errors += scan_result.walk_errors;

      files.extend(scan_result.files);
    }

    Ok(FileScanResult {
      files,
      total_files,
      walk_errors,
    })
  }

  pub async fn extract_metadata_for_files(
    files: &[PathBuf],
  ) -> Result<Vec<FileMetaData>, AppError> {
    let result: Vec<FileMetaData> = files
      .iter()
      .filter_map(|file| match MetadataP::get_file_metadata(&file) {
        Ok(meta) => Some(meta),
        Err(err) => {
          tracing::warn!(error = ?err, "Metadata Extraction Failed!");
          None
        }
      })
      .collect();

    Ok(result)
  }
}
