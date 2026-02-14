use crate::{
  application::{library, workflow::scan_and_import_images::ScanAndImportImages},
  error,
  interface::dto::{ImageCursor, ImportSummaryDto, PaginatedImages},
  setup::state::AppState,
};

use std::time::Instant;
use tauri::State;

#[tauri::command]
pub async fn import_images(
  state: State<'_, AppState>,
  paths: Vec<String>,
) -> Result<ImportSummaryDto, String> {
  let span = tracing::info_span!("import_images", paths = paths.len());
  let _enter = span.enter();

  let start = Instant::now();

  match ScanAndImportImages::run(&state.db, &paths).await {
    Ok(summary) => {
      tracing::info!("Import completed in {:?}", start.elapsed());
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

  let cursor = cursor.map(|c| {
    tracing::info!(
      created_at = c.created_at,
      id = c.id,
      "Fetching images with cursor"
    );
    (c.created_at, c.id)
  });

  match library::list_scanned_images(&state.db, limit, cursor).await {
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

// #[tauri::command]
// pub async fn fetch_images_grouped_by_hash(
//   state: State<'_, AppState>,
// ) -> Result<Vec<Vec<Image>>, String> {
//   let span = tracing::info_span!("fetch_images_grouped_by_hash");
//   let _enter = span.enter();

//   match library::list_images_grouped_by_hash(&state.db).await {
//     Ok(groups) => {
//       tracing::info!(groups = groups.len(), "Fetch grouped images completed");
//       Ok(groups)
//     }
//     Err(err) => {
//       tracing::error!(error = ?err, "Load failed");
//       Err(error::user_friendly_message(&err))
//     }
//   }
// }
