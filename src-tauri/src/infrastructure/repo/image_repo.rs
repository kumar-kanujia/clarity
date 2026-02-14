use crate::domain::file::file_scan::FileMetaData;
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
  cursor: Option<(String, i64)>,
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
    Some((created_at, id)) => {
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
