use crate::interface::dtos::{
  SearchOrderBy,
  image_dto::{ImageSearchCursor, ImageSortBy},
};
#[allow(clippy::needless_raw_strings)]
use crate::{
  domain::{
    file::FileMetaData,
    image::{Image, MAX_WORKER_RETRIES},
  },
  infrastructure::{
    models::image_model::{GalleryImageRow, ImageRow, ImageStatus},
    repo::error::DatabaseError,
  },
  interface::dtos::image_dto::ImageCursor,
  state::Db,
};

use sqlx::{QueryBuilder, Sqlite};

#[derive(Clone, Debug)]
pub struct ImageRepository {
  db: Db,
}

impl ImageRepository {
  pub fn new(db: Db) -> Self {
    Self { db }
  }

  pub async fn get_gallery_images(
    &self,
    limit: i64,
    cursor: Option<ImageCursor>,
  ) -> Result<Vec<GalleryImageRow>, DatabaseError> {
    let mut qb = QueryBuilder::new(
      r#" 
        SELECT id, file_name, path, size_bytes, width,
        height, thumbnail_path, created_at, is_favorite 
        FROM images
        WHERE is_deleted = 0
    "#,
    );

    if let Some(cursor) = cursor {
      qb.push(" AND (created_at, id) < (");
      qb.push_bind(cursor.created_at);
      qb.push(", ");
      qb.push_bind(cursor.id);
      qb.push(")");
    }

    qb.push(" ORDER BY created_at DESC, id DESC LIMIT ");
    qb.push_bind(limit);

    let result = qb
      .build_query_as::<GalleryImageRow>()
      .fetch_all(&self.db)
      .await?;

    Ok(result)
  }

  pub async fn update_image_is_favorite(&self, image_id: i64) -> Result<bool, DatabaseError> {
    let result = sqlx::query_scalar::<_, i64>(
      r#"
            UPDATE images
            SET is_favorite = NOT is_favorite
            WHERE id = ?1
            RETURNING is_favorite
      "#,
    )
    .bind(image_id)
    .fetch_one(&self.db)
    .await?;

    Ok(result == 1)
  }

  pub async fn create_images_by_file_metadata(
    &self,
    files: &[FileMetaData],
  ) -> Result<u64, DatabaseError> {
    if files.is_empty() {
      return Ok(0);
    }

    let mut query_builder =
      QueryBuilder::new("INSERT OR IGNORE INTO images (path, file_name, size_bytes, created_at) ");

    query_builder.push_values(files, |mut b, file| {
      b.push_bind(&file.path)
        .push_bind(&file.file_name)
        .push_bind(file.size_bytes)
        .push_bind(&file.created_at);
    });

    let result = query_builder.build().execute(&self.db).await?;
    Ok(result.rows_affected())
  }

  pub async fn list_images_with_tag_id_paginated(
    &self,
    tag_id: i64,
    limit: i64,
    cursor: Option<ImageCursor>,
  ) -> Result<Vec<ImageRow>, DatabaseError> {
    let mut query_builder = QueryBuilder::new(
      r#"
            SELECT i.*
            FROM images i
            JOIN image_tags it ON it.image_id = i.id
            WHERE it.tag_id =
            "#,
    );

    query_builder.push_bind(tag_id);

    if let Some(cursor) = cursor {
      query_builder.push(" AND (created_at, id) < (");
      query_builder.push_bind(cursor.created_at);
      query_builder.push(", ");
      query_builder.push_bind(cursor.id);
      query_builder.push(")");
    }

    query_builder.push(" ORDER BY created_at DESC, id DESC LIMIT ");
    query_builder.push_bind(limit);

    let result = query_builder
      .build_query_as::<ImageRow>()
      .fetch_all(&self.db)
      .await?;

    Ok(result)
  }

  pub async fn list_images_paginated(
    &self,
    limit: i64,
    cursor: Option<ImageCursor>,
  ) -> Result<Vec<ImageRow>, DatabaseError> {
    let mut query_builder = QueryBuilder::new("SELECT * FROM images");

    if let Some(cursor) = cursor {
      query_builder.push(" WHERE (created_at, id) < (");
      query_builder.push_bind(cursor.created_at);
      query_builder.push(", ");
      query_builder.push_bind(cursor.id);
      query_builder.push(")");
    }

    query_builder.push(" ORDER BY created_at DESC, id DESC LIMIT ");
    query_builder.push_bind(limit);

    let result = query_builder
      .build_query_as::<ImageRow>()
      .fetch_all(&self.db)
      .await?;

    Ok(result)
  }

  pub async fn list_images_by_status(
    &self,
    limit: i64,
    process_status: ImageStatus,
  ) -> Result<Vec<ImageRow>, DatabaseError> {
    let result = sqlx::query_as::<_, ImageRow>(
      r#"
        SELECT * FROM images
        WHERE status = ?1 AND retry_count < ?2
        LIMIT ?3
      "#,
    )
    .bind(process_status)
    .bind(MAX_WORKER_RETRIES)
    .bind(limit)
    .fetch_all(&self.db)
    .await?;

    Ok(result)
  }

  pub async fn update_images_hash(&self, updates: &[Image]) -> Result<u64, DatabaseError> {
    if updates.is_empty() {
      return Ok(0);
    }

    let mut tx = self.db.begin().await?;
    let mut total_updated = 0;

    let query_str = r#"
            UPDATE images
            SET
              content_hash = ?1,
              status = ?2,
              retry_count = ?3,
              error_message = ?4
            WHERE id = ?5
        "#;

    for update in updates {
      let result = sqlx::query(query_str)
        .bind(&update.content_hash)
        .bind(update.status)
        .bind(update.retry_count)
        .bind(&update.error_message)
        .bind(update.id)
        .execute(&mut *tx)
        .await?;
      total_updated += result.rows_affected();
    }

    tx.commit().await?;
    Ok(total_updated)
  }

  pub async fn update_images_metadata(&self, updates: &[Image]) -> Result<u64, DatabaseError> {
    if updates.is_empty() {
      return Ok(0);
    }

    let mut tx = self.db.begin().await?;
    let mut total_updated = 0;

    let query_str = r#"
              UPDATE images
              SET
                width = ?1,
                height = ?2,
                thumbnail_path = ?3,
                status = ?4,
                retry_count = ?5,
                error_message = ?6
              WHERE id = ?7
            "#;

    for update in updates {
      let result = sqlx::query(query_str)
        .bind(update.width)
        .bind(update.height)
        .bind(&update.thumbnail_path)
        .bind(update.status)
        .bind(update.retry_count)
        .bind(&update.error_message)
        .bind(update.id)
        .execute(&mut *tx)
        .await?;

      total_updated += result.rows_affected();
    }

    tx.commit().await?;
    Ok(total_updated)
  }

  pub async fn list_images_grouped_by_hash(
    &self,
    limit: i64,
    cursor_id: Option<i64>,
  ) -> Result<Vec<ImageRow>, DatabaseError> {
    let where_clause = if cursor_id.is_some() {
      "WHERE content_hash > COALESCE((SELECT content_hash FROM images WHERE id = ?), x'') AND content_hash IS NOT NULL"
    } else {
      "WHERE content_hash IS NOT NULL"
    };

    let query = format!(
      r#"
              SELECT *
              FROM images
              WHERE content_hash IN (
                  SELECT content_hash
                  FROM images
                  {where_clause}
                  GROUP BY content_hash
                  HAVING COUNT(*) > 1
                  ORDER BY content_hash ASC
                  LIMIT ?
              )
              ORDER BY content_hash ASC, created_at ASC;
              "#
    );

    let mut q = sqlx::query_as::<_, ImageRow>(&query);

    if let Some(id) = cursor_id {
      q = q.bind(id);
    }

    q = q.bind(limit);

    let result = q.fetch_all(&self.db).await?;
    Ok(result)
  }

  pub async fn find_by_ids(&self, image_ids: &[i64]) -> Result<Vec<ImageRow>, DatabaseError> {
    if image_ids.is_empty() {
      return Ok(vec![]);
    }

    let mut qb = QueryBuilder::<Sqlite>::new("SELECT * FROM images WHERE id IN (");

    let mut separated = qb.separated(", ");

    for id in image_ids {
      separated.push_bind(id);
    }

    separated.push_unseparated(")");

    let query = qb.build_query_as::<ImageRow>();

    let result = query.fetch_all(&self.db).await?;

    Ok(result)
  }

  fn push_sort(
    &self,
    qb: &mut QueryBuilder<Sqlite>,
    sort_by: &ImageSortBy,
    order_by: &SearchOrderBy,
  ) {
    qb.push(" ORDER BY ");

    match sort_by {
      ImageSortBy::FileName => qb.push("images.path"),
      ImageSortBy::Size => qb.push("images.size_bytes"),
      ImageSortBy::CreatedAt => qb.push("images.created_at"),
    };

    qb.push(", images.id ");

    match order_by {
      SearchOrderBy::Asc => qb.push("ASC"),
      SearchOrderBy::Desc => qb.push("DESC"),
    };
  }

  fn push_cursor_condition(
    &self,
    qb: &mut QueryBuilder<Sqlite>,
    cursor: &ImageSearchCursor,
    sort_by: &ImageSortBy,
    order_by: &SearchOrderBy,
  ) {
    qb.push(" AND (");

    match sort_by {
      ImageSortBy::FileName => qb.push("images.path"),
      ImageSortBy::Size => qb.push("images.size_bytes"),
      ImageSortBy::CreatedAt => qb.push("images.created_at"),
    };

    qb.push(", images.id) ");

    match order_by {
      SearchOrderBy::Asc => qb.push("> "),
      SearchOrderBy::Desc => qb.push("< "),
    };

    qb.push("(");
    qb.push_bind(cursor.last_value.clone());
    qb.push(", ");
    qb.push_bind(cursor.id);
    qb.push(")");
  }

  pub async fn find_all(
    &self,
    cursor: Option<&ImageSearchCursor>,
    sort_by: &ImageSortBy,
    order_by: SearchOrderBy,
    limit: i64,
  ) -> Result<Vec<ImageRow>, DatabaseError> {
    let mut qb = QueryBuilder::<Sqlite>::new("SELECT * FROM images WHERE 1=1");

    if let Some(cursor) = cursor {
      self.push_cursor_condition(&mut qb, cursor, &sort_by, &order_by);
    }

    self.push_sort(&mut qb, &sort_by, &order_by);

    qb.push(" LIMIT ");
    qb.push_bind(limit);

    Ok(qb.build_query_as().fetch_all(&self.db).await?)
  }

  pub async fn find_by_names(
    &self,
    file_names: &[String],
    cursor: Option<&ImageSearchCursor>,
    sort_by: &ImageSortBy,
    order_by: SearchOrderBy,
    limit: i64,
  ) -> Result<Vec<ImageRow>, DatabaseError> {
    let mut qb = QueryBuilder::<Sqlite>::new("SELECT * FROM images WHERE (");

    let mut separated = qb.separated(" OR ");

    for name in file_names {
      separated.push("LOWER(path) LIKE LOWER(");
      separated.push_bind(format!("%{}%", name));
      separated.push(")");
    }

    separated.push_unseparated(")");

    if let Some(cursor) = cursor {
      self.push_cursor_condition(&mut qb, cursor, &sort_by, &order_by);
    }

    self.push_sort(&mut qb, &sort_by, &order_by);

    qb.push(" LIMIT ");
    qb.push_bind(limit);

    Ok(qb.build_query_as().fetch_all(&self.db).await?)
  }

  pub async fn find_by_tags(
    &self,
    tags: &[i64],
    cursor: Option<&ImageSearchCursor>,
    sort_by: &ImageSortBy,
    order_by: SearchOrderBy,
    limit: i64,
  ) -> Result<Vec<ImageRow>, DatabaseError> {
    let mut qb = QueryBuilder::<Sqlite>::new(
      r#"
          SELECT DISTINCT images.*
          FROM images
          INNER JOIN image_tags
          ON image_tags.image_id = images.id
          WHERE image_tags.tag_id IN (
          "#,
    );

    let mut separated = qb.separated(", ");

    for tag in tags {
      separated.push_bind(tag);
    }

    separated.push_unseparated(")");

    if let Some(cursor) = cursor {
      self.push_cursor_condition(&mut qb, cursor, &sort_by, &order_by);
    }

    self.push_sort(&mut qb, &sort_by, &order_by);

    qb.push(" LIMIT ");
    qb.push_bind(limit);

    Ok(qb.build_query_as().fetch_all(&self.db).await?)
  }

  pub async fn find_by_names_and_tags(
    &self,
    file_names: &[String],
    tags: &[i64],
    cursor: Option<&ImageSearchCursor>,
    sort_by: &ImageSortBy,
    order_by: SearchOrderBy,
    limit: i64,
  ) -> Result<Vec<ImageRow>, DatabaseError> {
    let mut qb = QueryBuilder::<Sqlite>::new(
      r#"
          SELECT DISTINCT images.*
          FROM images
          INNER JOIN image_tags
          ON image_tags.image_id = images.id
          WHERE (
          "#,
    );

    let mut name_sep = qb.separated(" OR ");

    for name in file_names {
      name_sep.push("LOWER(images.path) LIKE LOWER(");
      name_sep.push_bind(format!("%{}%", name));
      name_sep.push(")");
    }

    name_sep.push_unseparated(")");

    qb.push(" AND image_tags.tag_id IN (");

    let mut tag_sep = qb.separated(", ");

    for tag in tags {
      tag_sep.push_bind(tag);
    }

    tag_sep.push_unseparated(")");

    if let Some(cursor) = cursor {
      self.push_cursor_condition(&mut qb, cursor, &sort_by, &order_by);
    }

    self.push_sort(&mut qb, &sort_by, &order_by);

    qb.push(" LIMIT ");
    qb.push_bind(limit);

    Ok(qb.build_query_as().fetch_all(&self.db).await?)
  }
}
