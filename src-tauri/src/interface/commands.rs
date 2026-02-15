use crate::{
  application::{
    service::{
      image_group_query_service::ImageGroupQueryService, image_query_service::ImageQueryService,
    },
    workflow::scan_and_import_images::ScanAndImportImages,
  },
  error,
  interface::dto::{ImageCursor, ImportSummaryDto, PaginatedImageHashGroups, PaginatedImages},
  setup::state::AppState,
};

use tauri::State;

#[tauri::command]
pub async fn import_images(
  state: State<'_, AppState>,
  paths: Vec<String>,
) -> Result<ImportSummaryDto, String> {
  let span = tracing::info_span!("import_images", paths = paths.len());
  let _enter = span.enter();

  let wf = ScanAndImportImages::new(&state.db);

  match wf.run(&paths).await {
    Ok(summary) => {
      tracing::info!("Import completed");
      Ok(summary.into())
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
pub async fn fetch_images(
  state: State<'_, AppState>,
  limit: i64,
  cursor: Option<ImageCursor>,
) -> Result<PaginatedImages, String> {
  let span = tracing::info_span!("fetch_images", limit = limit);
  let _enter = span.enter();

  let qs = ImageQueryService::new(&state.db);

  match qs.list_images_paginated(limit, cursor).await {
    Ok(paginated_images) => {
      tracing::info!(
        data = paginated_images.data.len(),
        "Fetch images completed:"
      );
      Ok(paginated_images)
    }
    Err(err) => {
      tracing::error!(error = ?err, "fetch_image failed");
      Err(error::user_friendly_message(&err))
    }
  }
}

#[tauri::command]
pub async fn fetch_images_grouped_by_hash(
  state: State<'_, AppState>,
  limit: i64,
  next_cursor: Option<i64>,
) -> Result<PaginatedImageHashGroups, String> {
  let span = tracing::info_span!("fetch_images_grouped_by_hash");
  let _enter = span.enter();

  let qs = ImageGroupQueryService::new(&state.db);

  match qs.list_images_grouped_by_hash(limit, next_cursor).await {
    Ok(groups) => {
      tracing::info!(groups = groups.data.len(), "Fetch grouped images completed");
      Ok(groups)
    }
    Err(err) => {
      tracing::error!(error = ?err, "Load failed");
      Err(error::user_friendly_message(&err))
    }
  }
}
