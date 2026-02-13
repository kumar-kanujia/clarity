#[allow(clippy::needless_raw_strings)]
use crate::infrastructure::repo::error::DatabaseError;
use crate::{domain::image::Image, setup::state::Db};

pub async fn bulk_insert_image(db: &Db, files: &[Image]) -> Result<u64, DatabaseError> {
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

// pub async fn list_images_grouped_by_hash(db: &Db) -> Result<Vec<ImageFile>, DatabaseError> {
//   let result = sqlx::query_as::<_, ImageFile>(
//     r#"
//       SELECT * FROM image_file
//       WHERE file_hash IN (
//       SELECT file_hash
//           FROM image_file
//           WHERE file_hash IS NOT NULL
//           GROUP BY file_hash
//           HAVING COUNT(*) > 1
//       )
//       ORDER BY file_hash, max_tx ASC
//     "#,
//   )
//   .fetch_all(db)
//   .await?;
//   Ok(result)
// }

// pub async fn list_images_paginated(
//   db: &Db,
//   last_max_tx: i64,
//   last_seq_id: i64,
//   limit: i64,
// ) -> Result<Vec<ImageFile>, DatabaseError> {
//   let result = sqlx::query_as::<_, ImageFile>(
//     r#"
//         SELECT *
//         FROM image_file
//         WHERE (max_tx, seq_id) < (?1, ?2)
//         ORDER BY max_tx DESC, seq_id DESC
//         LIMIT ?3
//         "#,
//   )
//   .bind(last_max_tx)
//   .bind(last_seq_id)
//   .bind(limit)
//   .fetch_all(db)
//   .await?;
//   Ok(result)
// }

// pub async fn list_image_paths_by_status(
//   db: &Db,
//   limit: i64,
//   process_status: ProcessStatus,
// ) -> Result<Vec<(i64, String)>, DatabaseError> {
//   let result = sqlx::query_as::<_, (i64, String)>(
//     r#"
//         SELECT
//           seq_id, file_path
//         FROM image_file
//         WHERE process_status = ?1
//         LIMIT ?2
//         "#,
//   )
//   .bind(process_status as i32)
//   .bind(limit)
//   .fetch_all(db)
//   .await?;
//   Ok(result)
// }

// pub async fn list_image_files_by_status(
//   db: &Db,
//   limit: i64,
//   process_status: ProcessStatus,
// ) -> Result<Vec<ImageFile>, DatabaseError> {
//   let result = sqlx::query_as::<_, ImageFile>(
//     r#"
//         SELECT *
//         FROM image_file
//         WHERE process_status = ?1
//         LIMIT ?2
//         "#,
//   )
//   .bind(process_status as i32)
//   .bind(limit)
//   .fetch_all(db)
//   .await?;
//   Ok(result)
// }

// pub async fn bulk_update_image_metadata(
//   pool: &Db,
//   updated_metadata: &[(i64, ImageMetadata)],
// ) -> Result<u64, DatabaseError> {
//   let mut tx = pool.begin().await?;

//   let mut total_rows = 0;

//   for (seq_id, meta_data) in updated_metadata {
//     let result = sqlx::query(
//       r#"
//             UPDATE image_file
//             SET
//                 thumbnail_path = ?1,
//                 dim_x = ?2,
//                 dim_y = ?3,
//                 process_status = ?4
//             WHERE seq_id = ?5
//             "#,
//     )
//     .bind(&meta_data.thumbnail_path)
//     .bind(meta_data.dim_x)
//     .bind(meta_data.dim_y)
//     .bind(ProcessStatus::Complete as i32)
//     .bind(seq_id)
//     .execute(&mut *tx)
//     .await?;

//     total_rows += result.rows_affected();
//   }

//   tx.commit().await?;

//   Ok(total_rows)
// }

// pub async fn bulk_update_image_hash(
//   pool: &Db,
//   data: &[(i64, String)],
// ) -> Result<u64, DatabaseError> {
//   let mut tx = pool.begin().await?;

//   let mut total_rows = 0;

//   for (seq_id, file_hash) in data {
//     let result = sqlx::query(
//       r#"
//             UPDATE image_file
//             SET
//                 file_hash = ?1,
//                 process_status = ?2,
//                 updated_at = ?3
//             WHERE seq_id = ?4
//             "#,
//     )
//     .bind(file_hash)
//     .bind(ProcessStatus::Hashed as i32)
//     .bind(get_unix_timestamp())
//     .bind(seq_id)
//     .execute(&mut *tx)
//     .await?;

//     total_rows += result.rows_affected();
//   }

//   tx.commit().await?;

//   Ok(total_rows)
// }
