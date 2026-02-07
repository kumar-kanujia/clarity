use std::io;

use futures::TryStreamExt;
use sqlx::{Row, SqlitePool};

use crate::domain::entity::ImageFile;

pub async fn save(db: &SqlitePool, image: &ImageFile) -> Result<(), sqlx::Error> {
  let sql = "INSERT INTO image_file 
    (filename, path, size_bytes, size_string, dimension_x, dimension_y, dimension_string, image_extension, original_path, mean_hash) 
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)";

  sqlx::query(sql)
    .bind(&image.filename)
    .bind(&image.path)
    .bind(image.size_bytes)
    .bind(&image.size_string)
    .bind(image.dimension_x)
    .bind(image.dimension_y)
    .bind(&image.dimension_string)
    .bind(&image.image_extension)
    .bind(&image.original_path)
    .bind(&image.mean_hash)
    .execute(db)
    .await?;

  Ok(())
}

pub async fn get_all_paths(db: &SqlitePool) -> Result<Vec<ImageFile>, sqlx::Error> {
  let files: Vec<ImageFile> = sqlx::query_as::<_, ImageFile>("SELECT * from image_file")
    .fetch(db)
    .try_collect()
    .await?;

  Ok(files)
}
