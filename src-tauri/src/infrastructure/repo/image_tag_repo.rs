use sqlx::QueryBuilder;

use crate::{
  infrastructure::{
    models::tag_model::{TagItemRow, TagType},
    repo::{NO_LIMIT, error::DatabaseError},
  },
  setup::state::Db,
};

pub struct ImageTagRepository {
  db: Db,
}

impl ImageTagRepository {
  pub fn new(db: Db) -> Self {
    Self { db }
  }

  // region: Helpers

  /// Appends `IN (?1, ?2, ...) ` to a query builder, binding each id.
  /// Caller is responsible for pushing the leading `IN` keyword separator if needed.
  fn push_in_clause<'qb>(qb: &'qb mut QueryBuilder<'_, sqlx::Sqlite>, ids: &[i64]) {
    qb.push("(");
    let mut sep = qb.separated(", ");
    for id in ids {
      sep.push_bind(*id);
    }
    sep.push_unseparated(")");
  }

  // endregion

  // region: Tag Mutation

  /// Toggles a tag on an image atomically. Returns `true` if the tag was
  /// added, `false` if it was removed.
  ///
  /// Uses a single INSERT OR IGNORE + DELETE pattern inside a transaction
  pub async fn toggle_image_tag(&self, image_id: i64, tag_id: i64) -> Result<bool, DatabaseError> {
    let mut tx = self.db.begin().await?;

    // Attempt to insert first; if already present the IGNORE swallows the conflict.
    let insert_res =
      sqlx::query("INSERT OR IGNORE INTO image_tags (image_id, tag_id) VALUES (?1, ?2)")
        .bind(image_id)
        .bind(tag_id)
        .execute(&mut *tx)
        .await?;

    // If nothing was inserted the tag already existed — remove it instead.
    if insert_res.rows_affected() == 0 {
      sqlx::query("DELETE FROM image_tags WHERE image_id = ?1 AND tag_id = ?2")
        .bind(image_id)
        .bind(tag_id)
        .execute(&mut *tx)
        .await?;

      tx.commit().await?;

      return Ok(false);
    }

    tx.commit().await?;
    Ok(true)
  }

  pub async fn create_image_tags(
    &self,
    image_ids: &[i64],
    tag_id: i64,
  ) -> Result<u64, DatabaseError> {
    if image_ids.is_empty() {
      return Ok(0);
    }

    let mut qb = QueryBuilder::new("INSERT OR IGNORE INTO image_tags (image_id, tag_id) ");

    qb.push_values(image_ids.iter(), |mut b, image_id| {
      b.push_bind(image_id).push_bind(tag_id);
    });

    let result = qb.build().execute(&self.db).await?;
    Ok(result.rows_affected())
  }

  pub async fn delete_image_tags(
    &self,
    image_ids: &[i64],
    tag_id: i64,
  ) -> Result<u64, DatabaseError> {
    if image_ids.is_empty() {
      return Ok(0);
    }

    let mut qb = QueryBuilder::new("DELETE FROM image_tags WHERE tag_id = ");

    qb.push_bind(tag_id);
    qb.push(" AND image_id IN ");

    Self::push_in_clause(&mut qb, image_ids);

    let result = qb.build().execute(&self.db).await?;
    Ok(result.rows_affected())
  }

  // endregion

  // region: Tag Query

  pub async fn get_tags_attached_to_image(
    &self,
    image_id: i64,
    tag_type: TagType,
    limit: Option<i64>,
  ) -> Result<Vec<TagItemRow>, DatabaseError> {
    let rows = sqlx::query_as::<_, TagItemRow>(
      r#"
      SELECT tags.id, tags.text, tags.color, tags.image_count
      FROM tags
      JOIN image_tags ON tags.id = image_tags.tag_id
      WHERE image_tags.image_id = ?1
        AND tags.tag_type = ?2
      ORDER BY tags.image_count DESC
      LIMIT ?3
      "#,
    )
    .bind(image_id)
    .bind(tag_type)
    .bind(limit.unwrap_or(NO_LIMIT))
    .fetch_all(&self.db)
    .await?;

    Ok(rows)
  }

  pub async fn get_tags_not_attached_to_image(
    &self,
    image_id: i64,
    tag_type: TagType,
    limit: Option<i64>,
  ) -> Result<Vec<TagItemRow>, DatabaseError> {
    let rows = sqlx::query_as::<_, TagItemRow>(
      r#"
      SELECT tags.id, tags.text, tags.color, tags.image_count
      FROM tags
      WHERE tags.tag_type = ?1
        AND NOT EXISTS (
            SELECT 1
            FROM image_tags
            WHERE image_tags.tag_id = tags.id
              AND image_tags.image_id = ?2
        )
      ORDER BY tags.image_count DESC
      LIMIT ?3
      "#,
    )
    .bind(tag_type)
    .bind(image_id)
    .bind(limit.unwrap_or(NO_LIMIT)) // The magic SQLite trick to bypass the limit if None
    .fetch_all(&self.db)
    .await?;

    Ok(rows)
  }

  pub async fn get_tags_attached_to_images(
    &self,
    image_ids: &[i64],
    tag_type: TagType,
    limit: Option<i64>,
  ) -> Result<Vec<TagItemRow>, DatabaseError> {
    if image_ids.is_empty() {
      return Ok(vec![]);
    }

    let mut qb = QueryBuilder::new(
      r#"
      SELECT tags.id, tags.text, tags.color, tags.image_count
      FROM tags
      JOIN image_tags ON tags.id = image_tags.tag_id
      WHERE tags.tag_type =
    "#,
    );

    qb.push_bind(tag_type);
    qb.push(" AND image_tags.image_id IN ");

    Self::push_in_clause(&mut qb, image_ids);

    qb.push(
      r#"
      GROUP BY tags.id, tags.text, tags.color, tags.image_count
      HAVING COUNT(DISTINCT image_tags.image_id) =
    "#,
    );

    qb.push_bind(image_ids.len() as i64);

    qb.push(" ORDER BY tags.image_count DESC");

    if let Some(limit) = limit {
      qb.push(" LIMIT ");
      qb.push_bind(limit);
    }

    let rows = qb
      .build_query_as::<TagItemRow>()
      .fetch_all(&self.db)
      .await?;

    Ok(rows)
  }

  pub async fn get_tags_not_attached_to_images(
    &self,
    image_ids: &[i64],
    tag_type: TagType,
    limit: Option<i64>,
  ) -> Result<Vec<TagItemRow>, DatabaseError> {
    if image_ids.is_empty() {
      return Ok(vec![]);
    }

    let mut qb = QueryBuilder::new(
      r#"
      SELECT tags.id, tags.text, tags.color, tags.image_count
      FROM tags
      LEFT JOIN image_tags
        ON tags.id = image_tags.tag_id
        AND image_tags.image_id IN (
    "#,
    );

    Self::push_in_clause(&mut qb, image_ids);

    qb.push(" WHERE tags.tag_type = ");

    qb.push_bind(tag_type);

    qb.push(
      r#"
      GROUP BY tags.id, tags.text, tags.color, tags.image_count
      HAVING COUNT(DISTINCT image_tags.image_id) <
    "#,
    );

    qb.push_bind(image_ids.len() as i64);

    qb.push(" ORDER BY tags.image_count DESC");

    if let Some(limit) = limit {
      qb.push(" LIMIT ");
      qb.push_bind(limit);
    }

    let rows = qb
      .build_query_as::<TagItemRow>()
      .fetch_all(&self.db)
      .await?;

    Ok(rows)
  }
}

#[cfg(test)]
mod tests {

  use super::*;

  use sqlx::SqlitePool;

  #[sqlx::test(migrations = "./migrations")]
  async fn test_toggle_image_tag(pool: SqlitePool) {
    let repo = ImageTagRepository::new(pool.clone());

    // 1. Setup: Create one image and one tag
    sqlx::query(
      "INSERT INTO images (id, path, file_name, size_bytes) VALUES (1, 't.jpg', 't.jpg', 1)",
    )
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query(
      "INSERT INTO tags (id, text, color, tag_type) VALUES (1, 'Blue', '#0000FF', 'user')",
    )
    .execute(&pool)
    .await
    .unwrap();

    // 2. First toggle (Insert)
    let attached = repo.toggle_image_tag(1, 1).await.expect("Toggle failed");
    assert!(attached, "First toggle should attach the tag");

    // 3. Second toggle (Delete)
    let attached_again = repo.toggle_image_tag(1, 1).await.expect("Toggle failed");

    assert!(!attached_again, "Second toggle should detach the tag");
  }

  #[sqlx::test(migrations = "./migrations")]
  async fn test_tag_attachment_queries(pool: SqlitePool) {
    let repo = ImageTagRepository::new(pool.clone());

    // 1. Setup: 1 Image, 2 Tags
    sqlx::query(
      "INSERT INTO images (id, path, file_name, size_bytes) VALUES (1, 'a.jpg', 'a.jpg', 1)",
    )
    .execute(&pool)
    .await
    .unwrap();
    sqlx::query(
      "INSERT INTO tags (id, text, color, tag_type) VALUES (1, 'Tagged', '#FF0000', 'user')",
    )
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query(
      "INSERT INTO tags (id, text, color, tag_type) VALUES (2, 'Untagged', '#0000FF', 'user')",
    )
    .execute(&pool)
    .await
    .unwrap();

    // 2. Attach Tag 1 to Image 1
    repo.toggle_image_tag(1, 1).await.unwrap();

    // 3. Test get_tags_attached_to_image
    let attached = repo
      .get_tags_attached_to_image(1, TagType::User, None)
      .await
      .unwrap();
    assert_eq!(attached.len(), 1);

    assert_eq!(attached[0].text, "Tagged");

    // 4. Test get_tags_not_attached_to_image
    let unattached = repo
      .get_tags_not_attached_to_image(1, TagType::User, None)
      .await
      .unwrap();

    assert_eq!(unattached.len(), 1);
    assert_eq!(unattached[0].text, "Untagged");
  }
}
