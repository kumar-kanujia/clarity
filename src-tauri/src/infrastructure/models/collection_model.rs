#[derive(Debug, sqlx::FromRow)]
pub struct CollectionStats {
  pub total_groups: i64,
  pub total_images: i64,
}
