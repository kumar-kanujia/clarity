use crate::{
  application::error::AppError, infrastructure::repo::collection_repo::CollectionRepository,
};

pub struct CollectionQueryService {
  pub collection_repo: CollectionRepository,
}

impl CollectionQueryService {
  pub fn new(collection_repo: CollectionRepository) -> Self {
    Self { collection_repo }
  }

  pub async fn fetch_exact_duplicate_stats(&self) -> Result<(i64, i64), AppError> {
    let fetched_stats = self.collection_repo.get_exact_duplicate_stats().await?;
    Ok((fetched_stats.total_groups, fetched_stats.total_images))
  }
}
