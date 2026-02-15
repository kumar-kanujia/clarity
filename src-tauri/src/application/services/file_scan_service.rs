use crate::{
  domain::file::file_scan::{FileMetaData, FileScanResult},
  error::AppError,
  infrastructure::{fs::fs_scanner::FileScanner, processing::metadata::MetadataP},
};

use std::{cmp, path::PathBuf};

use tokio::task::JoinSet;

pub struct FileScanService;

impl FileScanService {
  pub async fn scan_for_images(paths: &[String]) -> Result<FileScanResult, AppError> {
    if paths.is_empty() {
      return Ok(FileScanResult::default());
    }

    // --- Fast Path for Single Item ---
    // Avoids the overhead of JoinSet allocation and iteration
    if paths.len() == 1 {
      let path = PathBuf::from(&paths[0]);
      return tauri::async_runtime::spawn_blocking(move || {
        FileScanner::scan_path_for_images(&path).map_err(AppError::from)
      })
      .await
      .map_err(|e| AppError::Join(e.to_string()))?;
    }

    let num_threads = cmp::min(paths.len(), num_cpus::get());
    let chunk_size = (paths.len() + num_threads - 1) / num_threads;

    let mut scan_set = JoinSet::new();

    for chunk in paths.chunks(chunk_size) {
      // We convert the chunk of strings into a standard Vec<PathBuf>
      // to move it into the thread safely.
      let paths_chunk: Vec<PathBuf> = chunk.iter().map(PathBuf::from).collect();

      scan_set.spawn_blocking(move || {
        let mut chunk_result = FileScanResult::default();

        // Process all paths in this chunk sequentially within one thread
        for path in paths_chunk {
          match FileScanner::scan_path_for_images(&path) {
            Ok(res) => chunk_result.merge(res),
            Err(err) => {
              tracing::error!(error = ?err, path = path.display().to_string(), "Error occured while scaning for images");
              chunk_result.walk_errors += 1;
            }
          }
        }
        chunk_result
      });
    }
    let mut final_result = FileScanResult::default();

    while let Some(search) = scan_set.join_next().await {
      let chunk_result = search.map_err(|e| AppError::Join(e.to_string()))?;
      final_result.merge(chunk_result);
    }

    Ok(final_result)
  }

  pub async fn extract_metadata_for_files(
    files: &[PathBuf],
  ) -> Result<Vec<FileMetaData>, AppError> {
    let files = files.to_vec(); // Clone to own data

    // We wrap Rayon in spawn_blocking because Rayon blocks the thread it runs on
    let result = tauri::async_runtime::spawn_blocking(move || {
      use rayon::prelude::*; // Import parallel iterators

      files
        .par_iter()
        .filter_map(|file| match MetadataP::get_file_metadata(file) {
          Ok(meta) => Some(meta),
          Err(err) => {
            tracing::warn!(error = ?err, "Failed: {:?}", file);
            None
          }
        })
        .collect()
    })
    .await
    .map_err(|e| AppError::Join(e.to_string()))?;

    Ok(result)
  }
}
