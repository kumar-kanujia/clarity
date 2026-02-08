use crate::{domain::imagefile::ImageFile, state::Db};

pub async fn save(db: &Db, image: &ImageFile) -> Result<(), sqlx::Error> {
  sqlx::query(
    r#"
        INSERT INTO image_file (
            file_id,
            filename,
            size,
            dimension_x,
            dimension_y,
            image_extension,
            original_path
        )
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
        "#,
  )
  .bind(&image.file_id)
  .bind(&image.filename)
  .bind(image.size)
  .bind(image.dimension_x)
  .bind(image.dimension_y)
  .bind(&image.image_extension)
  .bind(&image.original_path)
  .execute(db)
  .await?;

  Ok(())
}

pub async fn get_all_paths(db: &Db) -> Result<Vec<ImageFile>, sqlx::Error> {
  sqlx::query_as::<_, ImageFile>("SELECT * FROM image_file")
    .fetch_all(db)
    .await
}
