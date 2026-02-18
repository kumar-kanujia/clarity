use crate::{
  domain::file::{FileMetaData, FileScanSummary},
  error::AppError,
  infrastructure::{fs::fs_scanner::FileScanner, processing::metadata::MetadataP},
};

use std::{cmp, path::PathBuf};

use tokio::task::JoinSet;

#[derive(Debug, Default)]
pub struct FileScanService;

impl FileScanService {
  pub async fn scan_paths_for_images(&self, paths: &[String]) -> Result<FileScanSummary, AppError> {
    if paths.is_empty() {
      return Ok(FileScanSummary::default());
    }

    // --- Fast Path for Single Item ---
    // Avoids the overhead of JoinSet allocation and iteration
    if paths.len() == 1 {
      let path = PathBuf::from(&paths[0]);
      return tauri::async_runtime::spawn_blocking(move || {
        FileScanner::scan_path_for_images(&path).map_err(AppError::from)
      })
      .await
      .map_err(|e| AppError::Join(format!("Join Error failed to scan path: {}", e.to_string())))?;
    }

    let num_threads = cmp::min(paths.len(), num_cpus::get());
    let chunk_size = (paths.len() + num_threads - 1) / num_threads;

    let mut scan_set = JoinSet::new();

    for chunk in paths.chunks(chunk_size) {
      // We convert the chunk of strings into a standard Vec<PathBuf>
      // to move it into the thread safely.
      let paths_chunk: Vec<PathBuf> = chunk.iter().map(PathBuf::from).collect();

      scan_set.spawn_blocking(move || {
        let mut chunk_summary = FileScanSummary::default();

        // Process all paths in this chunk sequentially within one thread
        for path in paths_chunk {
          match FileScanner::scan_path_for_images(&path) {
            Ok(res) => chunk_summary.merge(res),
            Err(err) => {
              tracing::error!(error = ?err, path = path.display().to_string(), "Error occured while scaning for images");
              chunk_summary.walk_errors += 1;
            }
          }
        }
        chunk_summary
      });
    }
    let mut final_summary = FileScanSummary::default();

    while let Some(search) = scan_set.join_next().await {
      let chunk_summary = search.map_err(|e| AppError::Join(e.to_string()))?;
      final_summary.merge(chunk_summary);
    }

    Ok(final_summary)
  }

  pub async fn extract_metadata_for_files(
    &self,
    files: Vec<PathBuf>,
  ) -> Result<Vec<FileMetaData>, AppError> {
    // We wrap Rayon in spawn_blocking because Rayon blocks the thread it runs on
    let result = tauri::async_runtime::spawn_blocking(move || {
      use rayon::prelude::*; // Import parallel iterators

      files
        .par_iter()
        .filter_map(|file| match MetadataP::get_file_metadata(file) {
          Ok(meta) => Some(meta),
          Err(err) => {
            tracing::warn!(error = ?err, "Metadata extraction failed for: {:?}", file);
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
