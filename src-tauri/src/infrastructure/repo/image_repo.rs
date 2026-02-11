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

pub async fn check_is_file_exists(db: &Db, file_path: &str) -> Result<bool, sqlx::Error> {
  let exists = sqlx::query_scalar::<_, bool>(
    r#"
        SELECT EXISTS (
            SELECT 1
            FROM image_file
            WHERE file_path = ?1
        )
        "#,
  )
  .bind(file_path)
  .fetch_one(db)
  .await?;

  Ok(exists)
}

pub async fn save_image_path(
  db: &Db,
  file_name: &str,
  file_path: &str,
) -> Result<i64, sqlx::Error> {
  let result = sqlx::query(
    r#"
        INSERT INTO image_file (file_name, file_path)
        VALUES (?1, ?2)
        "#,
  )
  .bind(&file_name)
  .bind(&file_path)
  .execute(db)
  .await?;

  Ok(result.last_insert_rowid())
}
