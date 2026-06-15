use crate::{
  infrastructure::{
    models::{collection_model::CollectionStats, image_model::ImageStatus},
    repo::error::DatabaseError,
  },
  setup::state::Db,
};

pub struct CollectionRepository {
  pub db: Db,
}

impl CollectionRepository {
  pub fn new(db: Db) -> Self {
    Self { db }
  }

  pub async fn get_exact_duplicate_stats(&self) -> Result<CollectionStats, DatabaseError> {
    let stats = sqlx::query_as::<_, CollectionStats>(
      r#"
        SELECT 
            COUNT(*)         as total_groups,
            SUM(group_count) as total_images
        FROM (
            SELECT content_hash, COUNT(*) as group_count
            FROM images
            WHERE 
                content_hash IS NOT NULL
                AND is_deleted = 0
                AND status != ?
            GROUP BY content_hash
            HAVING COUNT(*) > 1
        )
        "#,
    )
    .bind(ImageStatus::Pending)
    .fetch_one(&self.db)
    .await?;

    Ok(stats)
  }
}
