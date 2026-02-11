use sqlx::Result;

use crate::domain::filemetadata::FileMetadata;
#[allow(clippy::needless_raw_strings)]
use crate::{domain::imagefile::ImageFile, state::Db};

pub async fn get_images_batch(
  db: &Db,
  offset: i64,
  limit: i64,
) -> Result<Vec<ImageFile>, sqlx::Error> {
  sqlx::query_as::<_, ImageFile>(
    r#"
        SELECT *
        FROM image_file
        ORDER BY seq_id
        LIMIT ?1 OFFSET ?2
        "#,
  )
  .bind(limit)
  .bind(offset)
  .fetch_all(db)
  .await
}

pub async fn bulk_insert_image(db: &Db, files: &[FileMetadata]) -> Result<u64> {
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
      .push_bind(file.ctx.unwrap().cast_signed())
      .push_bind(file.mtx.unwrap().cast_signed());
  });

  let result = query_builder.build().execute(db).await?;

  Ok(result.rows_affected())
}

pub async fn get_pending_image_file(db: &Db, limit: i64) -> Result<Vec<ImageFile>> {
  sqlx::query_as::<_, ImageFile>(
    r#"
        SELECT *
        FROM image_file
        WHERE process_status = 0 or process_status = 2
        ORDER BY imported_at
        LIMIT ?1
        "#,
  )
  .bind(limit)
  .fetch_all(db)
  .await
}

pub async fn bulk_update_image_files(pool: &Db, images: &[ImageFile]) -> Result<u64> {
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
