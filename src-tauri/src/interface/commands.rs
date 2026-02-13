use crate::{
  application::{
    dtos::{Image, ImportSummary},
    importer, library,
  },
  error,
  setup::state::AppState,
};

use std::path::PathBuf;
use std::time::Instant;
use tauri::State;

#[tauri::command]
pub async fn save_images(
  state: State<'_, AppState>,
  paths: Vec<String>,
) -> Result<ImportSummary, String> {
  let span = tracing::info_span!("save_image", paths = paths.len());
  let _enter = span.enter();

  let t0 = Instant::now();
  let paths: Vec<PathBuf> = paths.into_iter().map(PathBuf::from).collect();

  match importer::scan_and_import_images(&state.db, paths).await {
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
      Err(error::user_friendly_message(&err))
    }
  }
}

#[tauri::command]
pub async fn fetch_scanned_images(
  state: State<'_, AppState>,
  last_max_tx: i64,
  last_seq_id: i64,
  limit: i64,
) -> Result<Vec<Image>, String> {
  let span = tracing::info_span!(
    "fetch_scanned_images",
    last_max_tx = last_max_tx,
    last_seq_id = last_seq_id,
    limit = limit
  );
  let _enter = span.enter();

  match library::list_scanned_images(&state.db, last_max_tx, last_seq_id, limit).await {
    Ok(images) => {
      tracing::info!(images = images.len(), "Fetch scanned images completed");
      Ok(images)
    }
    Err(err) => {
      tracing::error!(error = ?err, "Load failed");
      Err(error::user_friendly_message(&err))
    }
  }
}

#[tauri::command]
pub async fn fetch_images_grouped_by_hash(
  state: State<'_, AppState>,
) -> Result<Vec<Vec<Image>>, String> {
  let span = tracing::info_span!("fetch_images_grouped_by_hash");
  let _enter = span.enter();

  match library::list_images_grouped_by_hash(&state.db).await {
    Ok(images) => {
      tracing::info!(images = images.len(), "Fetch grouped images completed");
      Ok(images)
    }
    Err(err) => {
      tracing::error!(error = ?err, "Load failed");
      Err(error::user_friendly_message(&err))
    }
  }
}
