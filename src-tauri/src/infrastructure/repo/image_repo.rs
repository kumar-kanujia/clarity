use futures::TryStreamExt;
use sqlx::SqlitePool;

use crate::domain::imagefile::ImageFile;

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

#[cfg(test)]
mod tests {
  use super::*;
  use sqlx::SqlitePool;

  async fn setup_db() -> SqlitePool {
    let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();

    sqlx::query(
      r#"
            CREATE TABLE image_file (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                path TEXT NOT NULL,
                size_bytes INTEGER NOT NULL,
                size_string TEXT NOT NULL,
                dimension_x INTEGER NOT NULL,
                dimension_y INTEGER NOT NULL,
                dimension_string TEXT NOT NULL,
                image_extension TEXT NOT NULL,
                original_path TEXT NOT NULL,
                mean_hash TEXT NOT NULL
            )
            "#,
    )
    .execute(&pool)
    .await
    .unwrap();

    pool
  }

  #[tokio::test]
  async fn saves_image_file_into_database() {
    let db = setup_db().await;

    let image = ImageFile {
      id: 0,
      filename: "photo.png".into(),
      path: "/images/photo.png".into(),
      size_bytes: 12345,
      size_string: "12.35 KB".into(),
      dimension_x: 100,
      dimension_y: 200,
      dimension_string: "100x200".into(),
      image_extension: "png".into(),
      original_path: "".into(),
      mean_hash: "abc123".into(),
    };

    save(&db, &image).await.unwrap();

    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM image_file")
      .fetch_one(&db)
      .await
      .unwrap();

    assert_eq!(count, 1);
  }

  #[tokio::test]
  async fn returns_all_image_files() {
    let db = setup_db().await;

    let image1 = ImageFile {
      id: 0,
      filename: "a.jpg".into(),
      path: "/a.jpg".into(),
      size_bytes: 10,
      size_string: "0.01 KB".into(),
      dimension_x: 1,
      dimension_y: 1,
      dimension_string: "1x1".into(),
      image_extension: "jpg".into(),
      original_path: "".into(),
      mean_hash: "hash1".into(),
    };

    let image2 = ImageFile {
      id: 0,
      filename: "b.png".into(),
      path: "/b.png".into(),
      size_bytes: 20,
      size_string: "0.02 KB".into(),
      dimension_x: 2,
      dimension_y: 2,
      dimension_string: "2x2".into(),
      image_extension: "png".into(),
      original_path: "".into(),
      mean_hash: "hash2".into(),
    };

    save(&db, &image1).await.unwrap();
    save(&db, &image2).await.unwrap();

    let results = get_all_paths(&db).await.unwrap();

    assert_eq!(results.len(), 2);

    let filenames: Vec<_> = results.iter().map(|f| f.filename.as_str()).collect();
    assert!(filenames.contains(&"a.jpg"));
    assert!(filenames.contains(&"b.png"));
  }
}
