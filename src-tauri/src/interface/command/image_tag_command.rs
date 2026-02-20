use tauri::State;

use crate::{
  application::service::image_tag_service::ImageTagService,
  infrastructure::repo::image_tag_repo::ImageTagRepository, interface::dtos::tag_dto::TagItem,
  state::AppState,
};

#[tauri::command]
pub async fn toggle_tag(
  state: State<'_, AppState>,
  image_id: i64,
  tag_id: i64,
) -> Result<bool, String> {
  let span = tracing::info_span!("toggle_tag", image_id, tag_id);
  let _enter = span.enter();

  let repo = ImageTagRepository::new(state.db.clone());

  let its = ImageTagService::new(repo);

  match its.toggle_tag_on_image(image_id, tag_id).await {
    Ok(res) => {
      tracing::info!(
        res,
        "{} tag toggle on image {} completed:",
        tag_id,
        image_id
      );
      Ok(res)
    }
    Err(err) => {
      tracing::error!(error = ?err, image_id = image_id,image_id = image_id, "toggle_tag failed");
      Err(err.into())
    }
  }
}

#[tauri::command]
pub async fn fetch_attached_tags(
  state: State<'_, AppState>,
  image_id: i64,
  limit: Option<i64>,
) -> Result<Vec<TagItem>, String> {
  let span = tracing::info_span!("fetch_image_tags", image_id);
  let _enter = span.enter();

  let repo = ImageTagRepository::new(state.db.clone());

  let its = ImageTagService::new(repo);

  match its.list_attached_tags_on_image(image_id, limit).await {
    Ok(tags) => {
      tracing::info!(
        data = tags.len(),
        "Fetch tags for image {} completed:",
        image_id
      );
      Ok(tags)
    }
    Err(err) => {
      tracing::error!(error = ?err, image_id = image_id, "fetch_image_tags failed");
      Err(err.into())
    }
  }
}

#[tauri::command]
pub async fn fetch_available_tags(
  state: State<'_, AppState>,
  image_id: i64,
  limit: Option<i64>,
) -> Result<Vec<TagItem>, String> {
  let span = tracing::info_span!("fetch_available_tags", image_id);
  let _enter = span.enter();

  let repo = ImageTagRepository::new(state.db.clone());

  let its = ImageTagService::new(repo);

  match its.list_available_tags_on_image(image_id, limit).await {
    Ok(tags) => {
      tracing::info!(
        data = tags.len(),
        "Fetch available tags for image {} completed:",
        image_id
      );
      Ok(tags)
    }
    Err(err) => {
      tracing::error!(error = ?err, image_id = image_id, "fetch_available_tags failed");
      Err(err.into())
    }
  }
}
