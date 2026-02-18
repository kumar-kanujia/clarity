use crate::{
  application::{
    service::{file_scan_service::FileScanService, image_mutation_service::ImageMutationService},
    workflow::scan_and_import_images::ScanAndImportImages,
  },
  infrastructure::repo::image_repo::ImageRepository,
  interface::dtos::image_dto::ImportSummary,
  state::AppState,
};

use tauri::State;

#[tauri::command]
pub async fn import_images(
  state: State<'_, AppState>,
  paths: Vec<String>,
) -> Result<ImportSummary, String> {
  let span = tracing::info_span!("import_images", paths = paths.len());
  let _enter = span.enter();

  let repo = ImageRepository::new(state.db.clone());

  let mutation_service = ImageMutationService::new(repo);

  let file_service = FileScanService::default();

  let wf = ScanAndImportImages::new(mutation_service, file_service);

  match wf.scan_and_import_images(&paths).await {
    Ok(summary) => {
      tracing::info!("Import completed");
      Ok(summary)
    }
    Err(err) => {
      tracing::error!(
          error = ?err,
          "Import failed"
      );
      Err(err.into())
    }
  }
}

#[tauri::command]
pub async fn toggle_favorite(state: State<'_, AppState>, image_id: i64) -> Result<bool, String> {
  let span = tracing::info_span!("toggle_favorite", image_id);
  let _enter = span.enter();

  let repo = ImageRepository::new(state.db.clone());

  let ms = ImageMutationService::new(repo);

  match ms.change_image_is_favorite(image_id).await {
    Ok(is_favorite) => {
      tracing::info!(is_favorite, "Toggle favorite status changed:");
      Ok(is_favorite)
    }
    Err(err) => {
      tracing::error!(error = ?err, image_id = image_id, "toggle_favorite failed");
      Err(err.into())
    }
  }
}

#[tauri::command]
pub async fn mark_image_deleted(state: State<'_, AppState>, image_id: i64) -> Result<bool, String> {
  let span = tracing::info_span!("mark_image_deleted", image_id);
  let _enter = span.enter();

  let repo = ImageRepository::new(state.db.clone());

  let ms = ImageMutationService::new(repo);

  match ms.change_image_is_deleted(image_id, true).await {
    Ok(is_deleted) => {
      tracing::info!(is_deleted, "Image marked as deleted:");
      Ok(is_deleted)
    }
    Err(err) => {
      tracing::error!(error = ?err, image_id = image_id, "mark_image_deleted failed");
      Err(err.into())
    }
  }
}

// #[tauri::command]
// pub async fn search_images(
//   state: State<'_, AppState>,
//   query: ImageSearchQuery,
//   cursor: Option<ImageSearchCursor>,
// ) -> Result<ImageSearchResult, String> {
//   let span = tracing::info_span!("search_images", query = ?query);
//   let _enter = span.enter();

//   let qs = ImageQueryService::new(state.db.clone());

//   match qs.get_images_with_search_query(query, cursor).await {
//     Ok(images) => {
//       tracing::info!(total = images.data.len(), "Fetch image by ids completed:");
//       Ok(images)
//     }
//     Err(err) => {
//       tracing::error!(error = ?err, "fetch_image_by_ids failed");
//       Err(err.into())
//     }
//   }
// }

// #[tauri::command]
// pub async fn fetch_image_by_ids(
//   state: State<'_, AppState>,
//   image_ids: Vec<i64>,
// ) -> Result<Vec<ImageDto>, String> {
//   let span = tracing::info_span!("fetch_image_by_ids", image_ids = ?image_ids);
//   let _enter = span.enter();

//   let qs = ImageQueryService::new(state.db.clone());

//   match qs.get_images_with_ids(&image_ids).await {
//     Ok(images) => {
//       tracing::info!(
//         asked = image_ids.len(),
//         data = images.len(),
//         "Fetch image by ids completed:"
//       );
//       Ok(images)
//     }
//     Err(err) => {
//       tracing::error!(error = ?err, "fetch_image_by_ids failed");
//       Err(err.into())
//     }
//   }
// }

// #[tauri::command]
// pub async fn fetch_images(
//   state: State<'_, AppState>,
//   limit: i64,
//   cursor: Option<ImageCursor>,
// ) -> Result<PaginatedImages, String> {
//   let span = tracing::info_span!("fetch_images", limit = limit);
//   let _enter = span.enter();

//   let qs = ImageQueryService::new(state.db.clone());

//   match qs.list_images_paginated(limit, cursor).await {
//     Ok(paginated_images) => {
//       tracing::info!(
//         data = paginated_images.data.len(),
//         "Fetch images completed:"
//       );
//       Ok(paginated_images)
//     }
//     Err(err) => {
//       tracing::error!(error = ?err, "fetch_image failed");
//       Err(err.into())
//     }
//   }
// }

// #[tauri::command]
// pub async fn fetch_images_with_tag(
//   state: State<'_, AppState>,
//   tag_id: i64,
//   limit: i64,
//   cursor: Option<ImageCursor>,
// ) -> Result<PaginatedImages, String> {
//   let span = tracing::info_span!("fetch_images_with_tag", tag_id = tag_id, limit = limit);
//   let _enter = span.enter();

//   let qs = ImageQueryService::new(state.db.clone());

//   match qs
//     .list_images_with_tag_paginated(tag_id, limit, cursor)
//     .await
//   {
//     Ok(paginated_images) => {
//       tracing::info!(
//         data = paginated_images.data.len(),
//         "Fetch images completed:"
//       );
//       Ok(paginated_images)
//     }
//     Err(err) => {
//       tracing::error!(error = ?err, "fetch_images_with_tag failed");
//       Err(err.into())
//     }
//   }
// }

// #[tauri::command]
// pub async fn fetch_images_grouped_by_hash(
//   state: State<'_, AppState>,
//   limit: i64,
//   next_cursor: Option<i64>,
// ) -> Result<PaginatedImageHashGroups, String> {
//   let span = tracing::info_span!("fetch_images_grouped_by_hash");
//   let _enter = span.enter();

//   let qs = ImageQueryService::new(state.db.clone());

//   match qs.list_images_grouped_by_hash(limit, next_cursor).await {
//     Ok(groups) => {
//       tracing::info!(groups = groups.data.len(), "Fetch grouped images completed");
//       Ok(groups)
//     }
//     Err(err) => {
//       tracing::error!(error = ?err, "Load failed");
//       Err(err.into())
//     }
//   }
// }
