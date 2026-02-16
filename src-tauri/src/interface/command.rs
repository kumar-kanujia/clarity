use crate::{
  application::{
    service::{
      image_query_service::ImageQueryService, image_tag_service::ImageTagService,
      tag_service::TagService,
    },
    workflow::scan_and_import_images::ScanAndImportImages,
  },
  interface::dto::{
    ImageCursor, ImportSummaryDto, PaginatedImageHashGroups, PaginatedImages, TagDto,
  },
  state::AppState,
};

use tauri::State;

#[tauri::command]
pub async fn import_images(
  state: State<'_, AppState>,
  paths: Vec<String>,
) -> Result<ImportSummaryDto, String> {
  let span = tracing::info_span!("import_images", paths = paths.len());
  let _enter = span.enter();

  let wf = ScanAndImportImages::new(state.db.clone());

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
      Err(err.into())
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

  let qs = ImageQueryService::new(state.db.clone());

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
      Err(err.into())
    }
  }
}

#[tauri::command]
pub async fn fetch_images_with_tag(
  state: State<'_, AppState>,
  tag_id: i64,
  limit: i64,
  cursor: Option<ImageCursor>,
) -> Result<PaginatedImages, String> {
  let span = tracing::info_span!("fetch_images_with_tag", tag_id = tag_id, limit = limit);
  let _enter = span.enter();

  let qs = ImageQueryService::new(state.db.clone());

  match qs
    .list_images_with_tag_paginated(tag_id, limit, cursor)
    .await
  {
    Ok(paginated_images) => {
      tracing::info!(
        data = paginated_images.data.len(),
        "Fetch images completed:"
      );
      Ok(paginated_images)
    }
    Err(err) => {
      tracing::error!(error = ?err, "fetch_images_with_tag failed");
      Err(err.into())
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

  let qs = ImageQueryService::new(state.db.clone());

  match qs.list_images_grouped_by_hash(limit, next_cursor).await {
    Ok(groups) => {
      tracing::info!(groups = groups.data.len(), "Fetch grouped images completed");
      Ok(groups)
    }
    Err(err) => {
      tracing::error!(error = ?err, "Load failed");
      Err(err.into())
    }
  }
}

#[tauri::command]
pub async fn create_tag(state: State<'_, AppState>, tag_text: &str) -> Result<i64, String> {
  let span = tracing::info_span!("create_tag");
  let _enter = span.enter();

  let ts = TagService::new(state.db.clone());

  match ts.create_new_tag(tag_text).await {
    Ok(tag_id) => {
      tracing::info!("Tag created: {}", tag_text);
      Ok(tag_id)
    }
    Err(err) => {
      tracing::error!(error = ?err, "DB error");
      Err(err.into())
    }
  }
}

#[tauri::command]
pub async fn fetch_user_tags(state: State<'_, AppState>) -> Result<Vec<TagDto>, String> {
  let span = tracing::info_span!("fetch_user_tags");
  let _enter = span.enter();

  let ts = TagService::new(state.db.clone());

  match ts.get_user_tags().await {
    Ok(tags) => {
      tracing::info!("User tags fetched");
      Ok(tags)
    }
    Err(err) => {
      tracing::error!(error = ?err, "DB error");
      Err(err.into())
    }
  }
}

#[tauri::command]
pub async fn fetch_system_tags(state: State<'_, AppState>) -> Result<Vec<TagDto>, String> {
  let span = tracing::info_span!("fetch_system_tags");
  let _enter = span.enter();

  let ts = TagService::new(state.db.clone());

  match ts.get_system_tags().await {
    Ok(tags) => {
      tracing::info!("System tags fetched");
      Ok(tags)
    }
    Err(err) => {
      tracing::error!(error = ?err, "DB error");
      Err(err.into())
    }
  }
}

#[tauri::command]
pub async fn delete_tag(state: State<'_, AppState>, tag_id: i64) -> Result<(), String> {
  let span = tracing::info_span!("delete_tag");
  let _enter = span.enter();

  let ts = TagService::new(state.db.clone());

  match ts.delete_user_tag(tag_id).await {
    Ok(tags) => {
      tracing::info!("Tage removed with tag_id: {tag_id}");
      Ok(tags)
    }
    Err(err) => {
      tracing::error!(error = ?err, "DB error");
      Err(err.into())
    }
  }
}

#[tauri::command]
pub async fn toggle_tag_on_image(
  state: State<'_, AppState>,
  image_id: i64,
  tag_id: i64,
) -> Result<bool, String> {
  let span = tracing::info_span!("toggle_tag_on_image");
  let _enter = span.enter();

  let ts = ImageTagService::new(state.db.clone());

  match ts.toggle_tag(image_id, tag_id).await {
    Ok(toggled) => {
      tracing::info!("{tag_id}: Tag has been toggled on image with id: {image_id}");
      Ok(toggled)
    }
    Err(err) => {
      tracing::error!(error = ?err, "DB error");
      Err(err.into())
    }
  }
}
