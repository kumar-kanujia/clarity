use crate::{
  application::service::tag_service::TagService,
  infrastructure::repo::tag_repo::TagRepository,
  interface::{dtos::tag_dto::TagItem, error::CommandError},
  setup::{settings::TAG_TOP_FETCH_LIMIT, state::AppState},
};

use tauri::State;

#[tauri::command]
#[tracing::instrument(skip(state), fields(tag_name = tag_name, color = color))]
pub async fn create_tag(
  state: State<'_, AppState>,
  tag_name: &str,
  color: &str,
) -> Result<i64, CommandError> {
  let tag_repository = TagRepository::new(state.db.clone());
  let tag_service = TagService::new(tag_repository);
  let tag_id = tag_service.create_new_user_tag(tag_name, color).await?;
  tracing::info!(tag_id = tag_id, "Tag created");
  Ok(tag_id)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(tag_id=tag_id, tag_name = tag_name, tag_color = tag_color))]
pub async fn edit_tag(
  state: State<'_, AppState>,
  tag_id: i64,
  tag_name: Option<String>,
  tag_color: Option<String>,
) -> Result<(), CommandError> {
  let tag_repository = TagRepository::new(state.db.clone());
  let tag_service = TagService::new(tag_repository);
  tag_service
    .edit_user_tag(tag_id, tag_name, tag_color)
    .await?;
  tracing::info!(tag_id = tag_id, "Tag edited");
  Ok(())
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(tag_id=tag_id))]
pub async fn soft_delete_tag(state: State<'_, AppState>, tag_id: i64) -> Result<(), CommandError> {
  let tag_repository = TagRepository::new(state.db.clone());
  let tag_service = TagService::new(tag_repository);
  tag_service.soft_delete_user_tag(tag_id).await?;
  tracing::info!(tag_id = tag_id, "Tag softly deleted");
  Ok(())
}

#[tauri::command]
#[tracing::instrument(skip(state))]
pub async fn fetch_top_tags(state: State<'_, AppState>) -> Result<Vec<TagItem>, CommandError> {
  let tag_repository = TagRepository::new(state.db.clone());
  let tag_service = TagService::new(tag_repository);
  let tags = tag_service
    .list_user_tags(Some(TAG_TOP_FETCH_LIMIT))
    .await?;
  tracing::info!(count = tags.len(), "Fetched top tags");
  Ok(tags)
}

#[tauri::command]
#[tracing::instrument(skip(state))]
pub async fn fetch_all_tags(state: State<'_, AppState>) -> Result<Vec<TagItem>, CommandError> {
  let tag_repository = TagRepository::new(state.db.clone());
  let tag_service = TagService::new(tag_repository);
  let tags = tag_service.list_user_tags(None).await?;
  tracing::info!(count = tags.len(), "Fetched all tags");
  Ok(tags)
}
