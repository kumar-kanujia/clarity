use tauri::State;

use crate::{
  application::service::tag_service::TagService,
  infrastructure::{models::tag_model::TagType, repo::tag_repo::TagRepository},
  interface::{dtos::tag_dto::TagItem, error::CommandError},
  setup::{settings::TAG_TOP_FETCH_LIMIT, state::AppState},
};

fn make_tag_service(state: &State<'_, AppState>) -> TagService {
  TagService::new(TagRepository::new(state.db.clone()))
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(tag_name, color))]
pub async fn create_tag(
  state: State<'_, AppState>,
  tag_name: &str,
  color: &str,
) -> Result<i64, CommandError> {
  let tag_id = make_tag_service(&state)
    .create_new_user_tag(tag_name, color)
    .await?;
  tracing::info!(tag_id, "Tag created");
  Ok(tag_id)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(tag_id, has_name = tag_name.is_some(), has_color = tag_color.is_some()))]
pub async fn edit_tag(
  state: State<'_, AppState>,
  tag_id: i64,
  tag_name: Option<String>,
  tag_color: Option<String>,
) -> Result<(), CommandError> {
  make_tag_service(&state)
    .edit_user_tag(tag_id, tag_name, tag_color)
    .await?;
  tracing::info!(tag_id, "Tag edited");
  Ok(())
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(tag_id))]
pub async fn mark_tag_inactive(
  state: State<'_, AppState>,
  tag_id: i64,
) -> Result<(), CommandError> {
  make_tag_service(&state)
    .change_tag_type(tag_id, TagType::Inactive)
    .await?;
  tracing::info!(tag_id, "Tag marked inactive");
  Ok(())
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(tag_id))]
pub async fn mark_tag_active(state: State<'_, AppState>, tag_id: i64) -> Result<(), CommandError> {
  make_tag_service(&state)
    .change_tag_type(tag_id, TagType::User)
    .await?;
  tracing::info!(tag_id, "Tag marked active");
  Ok(())
}

#[tauri::command]
#[tracing::instrument(skip(state))]
pub async fn fetch_active_tags(state: State<'_, AppState>) -> Result<Vec<TagItem>, CommandError> {
  let tags = make_tag_service(&state).list_user_tags(None).await?;
  tracing::info!(count = tags.len(), "Active tags fetched");
  Ok(tags)
}

#[tauri::command]
#[tracing::instrument(skip(state))]
pub async fn fetch_inactive_tags(state: State<'_, AppState>) -> Result<Vec<TagItem>, CommandError> {
  let tags = make_tag_service(&state)
    .list_user_inactive_tags(None)
    .await?;
  tracing::info!(count = tags.len(), "Inactive tags fetched");
  Ok(tags)
}

#[tauri::command]
#[tracing::instrument(skip(state), fields(tag_id))]
pub async fn delete_tag(state: State<'_, AppState>, tag_id: i64) -> Result<(), CommandError> {
  make_tag_service(&state).delete_tag(tag_id).await?;
  tracing::info!(tag_id, "Tag deleted");
  Ok(())
}

#[tauri::command]
#[tracing::instrument(skip(state))]
pub async fn fetch_top_tags(state: State<'_, AppState>) -> Result<Vec<TagItem>, CommandError> {
  let tags = make_tag_service(&state)
    .list_user_tags(Some(TAG_TOP_FETCH_LIMIT))
    .await?;
  tracing::info!(
    count = tags.len(),
    limit = TAG_TOP_FETCH_LIMIT,
    "Top tags fetched"
  );
  Ok(tags)
}
