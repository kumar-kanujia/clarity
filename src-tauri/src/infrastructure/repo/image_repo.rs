use crate::{domain::file::file_scan::FileMetaData, interface::dto::ImageCursor};
#[allow(clippy::needless_raw_strings)]
use crate::{
  domain::image::Image,
  infrastructure::{
    models::image_model::{ImageModel, ImageStatus},
    repo::error::DatabaseError,
  },
  setup::state::Db,
};

pub async fn create_images_by_file_metadata(
  db: &Db,
  files: &[FileMetaData],
) -> Result<u64, DatabaseError> {
  if files.is_empty() {
    return Ok(0);
  }
  let mut query_builder =
    sqlx::QueryBuilder::new("INSERT OR IGNORE INTO images (path, size_bytes, created_at) ");

  query_builder.push_values(files, |mut b, file| {
    b.push_bind(&file.path)
      .push_bind(file.size_bytes) // i64
      .push_bind(&file.created_at); // ISO 8601 String
  });

  let result = query_builder.build().execute(db).await?;

  Ok(result.rows_affected())
}

pub async fn list_images_paginated(
  db: &Db,
  limit: i64,
  cursor: Option<ImageCursor>,
) -> Result<Vec<ImageModel>, DatabaseError> {
  let result = match cursor {
    None => {
      sqlx::query_as::<_, ImageModel>(
        r#"
              SELECT *
              FROM images
              ORDER BY created_at DESC, id DESC
              LIMIT ?1
            "#,
      )
      .bind(limit)
      .fetch_all(db)
      .await?
    }
    Some(ImageCursor { created_at, id }) => {
      sqlx::query_as::<_, ImageModel>(
        r#"
              SELECT *
              FROM images
              WHERE (created_at, id) < (?1, ?2)
              ORDER BY created_at DESC, id DESC
              LIMIT ?3
            "#,
      )
      .bind(created_at)
      .bind(id)
      .bind(limit)
      .fetch_all(db)
      .await?
    }
  };
  Ok(result)
}

pub async fn list_images_by_status(
  db: &Db,
  limit: i64,
  process_status: ImageStatus,
) -> Result<Vec<ImageModel>, DatabaseError> {
  let result = sqlx::query_as::<_, ImageModel>(
    r#"
        SELECT *
        FROM images
        WHERE status = ?1 and retry_count < 3
        LIMIT ?2
        "#,
  )
  .bind(process_status)
  .bind(limit)
  .fetch_all(db)
  .await?;
  Ok(result)
}

pub async fn update_images_hash(db: &Db, images: &[Image]) -> Result<u64, DatabaseError> {
  if images.is_empty() {
    return Ok(0);
  }

  let mut tx = db.begin().await?;

  let mut total_updated = 0;

  for image in images {
    let result = sqlx::query(
      r#"
            UPDATE images
            SET
              content_hash = ?1,
              status = ?2,
              retry_count = ?3,
              error_message = ?4
            WHERE id = ?5
            "#,
    )
    .bind(&image.content_hash)
    .bind(image.status)
    .bind(image.retry_count)
    .bind(&image.error_message)
    .bind(image.id)
    .execute(&mut *tx)
    .await?;

    total_updated += result.rows_affected();
  }

  tx.commit().await?;

  Ok(total_updated)
}

pub async fn update_images_metadata(db: &Db, images: &[Image]) -> Result<u64, DatabaseError> {
  if images.is_empty() {
    return Ok(0);
  }

  let mut tx = db.begin().await?;

  let mut total_updated = 0;

  for image in images {
    let result = sqlx::query(
      r#"
            UPDATE images
            SET
              width = ?1,
              height = ?2,
              thumbnail_path = ?3,
              status = ?4,
              retry_count = ?5,
              error_message = ?6
            WHERE id = ?7
            "#,
    )
    .bind(image.width)
    .bind(image.height)
    .bind(&image.thumbnail_path)
    .bind(image.status)
    .bind(image.retry_count)
    .bind(&image.error_message)
    .bind(image.id)
    .execute(&mut *tx)
    .await?;

    total_updated += result.rows_affected();
  }

  tx.commit().await?;

  Ok(total_updated)
}

pub async fn list_images_grouped_by_hash(
  db: &Db,
  limit: i64,
  cursor: Option<Vec<u8>>,
) -> Result<Vec<ImageModel>, DatabaseError> {
  let result = match cursor {
    None => {
      sqlx::query_as::<_, ImageModel>(
        r#"
                SELECT *
                FROM images
                WHERE content_hash IN (
                    SELECT content_hash
                    FROM images
                    WHERE content_hash IS NOT NULL
                    GROUP BY content_hash
                    HAVING COUNT(*) > 1
                    ORDER BY content_hash ASC
                    LIMIT ?1
                )
                ORDER BY content_hash ASC, created_at ASC;
            "#,
      )
      .bind(limit)
      .fetch_all(db)
      .await?
    }
    Some(blob) => {
      sqlx::query_as::<_, ImageModel>(
        r#"
              SELECT *
              FROM images
              WHERE content_hash IN (
                  SELECT content_hash
                  FROM images
                  WHERE content_hash > ?1
                  AND content_hash IS NOT NULL
                  GROUP BY content_hash
                  HAVING COUNT(*) > 1
                  ORDER BY content_hash ASC
                  LIMIT ?2
              )
              ORDER BY content_hash ASC, created_at ASC;
            "#,
      )
      .bind(blob)
      .bind(limit)
      .fetch_all(db)
      .await?
    }
  };
  Ok(result)
}
