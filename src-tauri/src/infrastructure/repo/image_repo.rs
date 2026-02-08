use crate::domain::imagefile::ImageFile;

use futures::TryStreamExt;
use sqlx::SqlitePool;

pub async fn save(db: &SqlitePool, image: &ImageFile) -> Result<(), sqlx::Error> {
  let sql = "INSERT INTO image_file 
    (file_id, filename, size, dimension_x, dimension_y, image_extension, original_path) 
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)";

  sqlx::query(sql)
    .bind(&image.file_id)
    .bind(&image.filename)
    .bind(image.size)
    .bind(image.dimension_x)
    .bind(image.dimension_y)
    .bind(&image.image_extension)
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
