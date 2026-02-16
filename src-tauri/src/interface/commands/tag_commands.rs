use crate::{
  application::service::{image_tag_service::ImageTagService, tag_service::TagService},
  interface::dtos::tag_dto::TagDto,
  state::AppState,
};

use tauri::State;

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
