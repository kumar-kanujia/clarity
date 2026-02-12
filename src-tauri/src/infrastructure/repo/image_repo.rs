#[allow(clippy::needless_raw_strings)]
use crate::{
  domain::{filemetadata::FileMetadata, imagefile::ImageFile},
  infrastructure::repo::error::DatabaseError,
  state::Db,
};

pub async fn list_images_paginated(
  db: &Db,
  last_seq_id: i64,
  limit: i64,
) -> Result<Vec<ImageFile>, DatabaseError> {
  let result = sqlx::query_as::<_, ImageFile>(
    r#"
        SELECT *
        FROM image_file
        WHERE seq_id > ?1
        ORDER BY seq_id ASC
        LIMIT ?2
        "#,
  )
  .bind(last_seq_id)
  .bind(limit)
  .fetch_all(db)
  .await?;
  Ok(result)
}

pub async fn bulk_insert_image(db: &Db, files: &[FileMetadata]) -> Result<u64, DatabaseError> {
  if files.is_empty() {
    return Ok(0);
  }

  let mut query_builder = sqlx::QueryBuilder::new(
    "INSERT OR IGNORE INTO image_file (file_name, file_path, file_size, ctx, mtx) ",
  );

  query_builder.push_values(files, |mut b, file| {
    b.push_bind(&file.file_name)
      .push_bind(&file.file_path)
      .push_bind(file.file_size.cast_signed())
      .push_bind(file.ctx.map(u64::cast_signed))
      .push_bind(file.mtx.map(u64::cast_signed));
  });

  let result = query_builder.build().execute(db).await?;

  Ok(result.rows_affected())
}

pub async fn list_pending_process_image_file(
  db: &Db,
  limit: i64,
) -> Result<Vec<ImageFile>, DatabaseError> {
  let result = sqlx::query_as::<_, ImageFile>(
    r#"
        SELECT *
        FROM image_file
        WHERE process_status = 0
        ORDER BY imported_at
        LIMIT ?1
        "#,
  )
  .bind(limit)
  .fetch_all(db)
  .await?;
  Ok(result)
}

pub async fn bulk_update_image_metadata(
  pool: &Db,
  images: &[ImageFile],
) -> Result<u64, DatabaseError> {
  let mut tx = pool.begin().await?;

  let mut total_rows = 0;

  for image in images {
    let result = sqlx::query(
      r#"
            UPDATE image_file
            SET
                thumbnail_path = ?1,
                dim_x = ?2,
                dim_y = ?3,
                process_status = ?4
            WHERE seq_id = ?5
            "#,
    )
    .bind(&image.thumbnail_path)
    .bind(image.dim_x)
    .bind(image.dim_y)
    .bind(image.process_status)
    .bind(image.seq_id)
    .execute(&mut *tx)
    .await?;

    total_rows += result.rows_affected();
  }

  tx.commit().await?;

  Ok(total_rows)
}
