use tauri::State;

use crate::{
  application::service::tag_service::TagService, interface::dto::TagDto, setup::state::AppState,
};

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
      Err(err.user_message())
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
      Err(err.user_message())
    }
  }
}

#[tauri::command]
pub async fn fetch_system_tags(state: State<'_, AppState>) -> Result<Vec<TagDto>, String> {
  let span = tracing::info_span!("fetch_system_tags");
  let _enter = span.enter();

  let ts = TagService::new(state.db.clone());

  match ts.get_user_tags().await {
    Ok(tags) => {
      tracing::info!("System tags fetched");
      Ok(tags)
    }
    Err(err) => {
      tracing::error!(error = ?err, "DB error");
      Err(err.user_message())
    }
  }
}
