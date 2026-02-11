use crate::domain::filemetadata::FileMetadata;
#[allow(clippy::needless_raw_strings)]
use crate::{domain::imagefile::ImageFile, state::Db};

pub async fn get_in_batch(db: &Db, offset: i64, limit: i64) -> Result<Vec<ImageFile>, sqlx::Error> {
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

pub async fn bulk_insert_image(db: &Db, files: &[FileMetadata]) -> Result<u64, sqlx::Error> {
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
      .push_bind(file.ctx.cast_signed())
      .push_bind(file.mtx.cast_signed());
  });

  let result = query_builder.build().execute(db).await?;

  Ok(result.rows_affected())
}
