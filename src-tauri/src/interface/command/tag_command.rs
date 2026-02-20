use crate::{
  application::service::tag_service::TagService,
  infrastructure::repo::tag_repo::TagRepository,
  interface::{dtos::tag_dto::TagItem, error::CommandError},
  state::AppState,
};

use tauri::State;

#[tauri::command]
#[tracing::instrument(skip(state), fields(tag_text = tag_text, color = color))]
pub async fn create_tag(
  state: State<'_, AppState>,
  tag_text: &str,
  color: &str,
) -> Result<i64, CommandError> {
  let tag_repository = TagRepository::new(state.db.clone());
  let tag_service = TagService::new(tag_repository);
  let tag_id = tag_service.create_new_user_tag(tag_text, color).await?;
  tracing::info!(tag_id = tag_id, "Tag created");
  Ok(tag_id)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(tag_id=tag_id, tag_text = tag_text, tag_color = tag_color))]
pub async fn edit_tag(
  state: State<'_, AppState>,
  tag_id: i64,
  tag_text: Option<String>,
  tag_color: Option<String>,
) -> Result<(), CommandError> {
  let tag_repository = TagRepository::new(state.db.clone());
  let tag_service = TagService::new(tag_repository);
  tag_service
    .edit_user_tag(tag_id, tag_text, tag_color)
    .await?;
  tracing::info!("Tag edited: {}", tag_id);
  Ok(())
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(tag_id=tag_id))]
pub async fn soft_delete_tag(state: State<'_, AppState>, tag_id: i64) -> Result<(), CommandError> {
  let tag_repository = TagRepository::new(state.db.clone());
  let tag_service = TagService::new(tag_repository);
  tag_service.soft_delete_user_tag(tag_id).await?;
  tracing::info!("Tag softly deleted: {}", tag_id);
  Ok(())
}

#[tauri::command]
#[tracing::instrument(skip(state))]
pub async fn fetch_top_tags(state: State<'_, AppState>) -> Result<Vec<TagItem>, CommandError> {
  let tag_repository = TagRepository::new(state.db.clone());
  let tag_service = TagService::new(tag_repository);
  let tags = tag_service.list_top_user_tags().await?;
  tracing::info!("Fetched top tags, count: {}", tags.len());
  Ok(tags)
}

#[tauri::command]
#[tracing::instrument(skip(state))]
pub async fn fetch_all_tags(state: State<'_, AppState>) -> Result<Vec<TagItem>, CommandError> {
  let tag_repository = TagRepository::new(state.db.clone());
  let tag_service = TagService::new(tag_repository);
  let tags = tag_service.list_all_user_tags().await?;
  tracing::info!("Fetched all tags, count: {}", tags.len());
  Ok(tags)
}
