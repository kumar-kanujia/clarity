use tauri::State;

use crate::{
  application::service::collection_query_service::CollectionQueryService,
  infrastructure::repo::collection_repo::CollectionRepository, interface::error::CommandError,
  setup::state::AppState,
};

fn make_query_service(state: &AppState) -> CollectionQueryService {
  CollectionQueryService::new(CollectionRepository::new(state.db.clone()))
}

#[tauri::command]
#[tracing::instrument(skip(state))]
pub async fn exact_duplicate_stats(state: State<'_, AppState>) -> Result<(i64, i64), CommandError> {
  let result = make_query_service(&state)
    .fetch_exact_duplicate_stats()
    .await?;
  tracing::info!("Fetched exact duplicate stats");
  Ok(result)
}
