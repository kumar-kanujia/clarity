use crate::application::dto::{Image, ImportSummary};
use crate::application::gallery;
use crate::application::importer::scan_and_import_images;
use crate::error::user_friendly_message;
use crate::state::AppState;

use std::path::PathBuf;
use std::time::Instant;
use tauri::State;

#[tauri::command]
pub async fn save_images(
  state: State<'_, AppState>,
  paths: Vec<String>,
) -> Result<ImportSummary, String> {
  tracing::info!("Save command called");
  let t0 = Instant::now();
  let paths: Vec<PathBuf> = paths.into_iter().map(PathBuf::from).collect();

  match scan_and_import_images(&state.db, paths).await {
    Ok(summary) => {
      tracing::info!("Import completed in {:?}", t0.elapsed());
      tracing::info!(
        discovered = summary.discovered,
        processed = summary.processed,
        imported = summary.imported,
        skipped = summary.skipped,
        metadata_not_found = summary.not_found,
        metadata_permission_denied = summary.permission_denied,
        metadata_io_errors = summary.io_errors,
        walk_errors = summary.walk_errors,
        "Import completed"
      );
      Ok(summary)
    }
    Err(err) => {
      tracing::error!(
          error = ?err,
          "Import failed"
      );
      Err(user_friendly_message(&err))
    }
  }
}

#[tauri::command]
pub async fn load_saved_images(
  state: State<'_, AppState>,
  offset: i64,
  limit: i64,
) -> Result<Vec<Image>, String> {
  tracing::info!("Load command called");
  let result = gallery::load_saved_images_in_batch(&state.db, offset, limit)
    .await
    .map_err(|e| {
      tracing::error!("Failed to load images: {}", e);
      e.to_string()
    })?;

  Ok(result)
}
