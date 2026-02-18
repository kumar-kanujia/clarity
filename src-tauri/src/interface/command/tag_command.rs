use crate::{
  application::service::tag_service::TagService, infrastructure::repo::tag_repo::TagRepository,
  interface::dtos::tag_dto::TagItem, state::AppState,
};

use tauri::State;

#[tauri::command]
pub async fn create_tag(
  state: State<'_, AppState>,
  tag_text: &str,
  color: &str,
) -> Result<i64, String> {
  let span = tracing::info_span!("create_tag");
  let _enter = span.enter();

  let tag_repo = TagRepository::new(state.db.clone());

  let ts = TagService::new(tag_repo);

  match ts.create_new_user_tag(tag_text, color).await {
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
pub async fn soft_delete_tag(state: State<'_, AppState>, tag_id: i64) -> Result<(), String> {
  let span = tracing::info_span!("soft_delete_tag");
  let _enter = span.enter();

  let tag_repo = TagRepository::new(state.db.clone());

  let ts = TagService::new(tag_repo);

  match ts.soft_delete_user_tag(tag_id).await {
    Ok(_) => {
      tracing::info!("Tag softly deleted: {}", tag_id);
      Ok(())
    }
    Err(err) => {
      tracing::error!(error = ?err, "DB error");
      Err(err.into())
    }
  }
}

#[tauri::command]
pub async fn fetch_top_tags(state: State<'_, AppState>) -> Result<Vec<TagItem>, String> {
  let span = tracing::info_span!("fetch_top_tags");
  let _enter = span.enter();

  let tag_repo = TagRepository::new(state.db.clone());

  let ts = TagService::new(tag_repo);

  match ts.list_top_user_tags().await {
    Ok(tags) => {
      tracing::info!("Fetched top tags, count: {}", tags.len());
      Ok(tags)
    }
    Err(err) => {
      tracing::error!(error = ?err, "DB error");
      Err(err.into())
    }
  }
}
