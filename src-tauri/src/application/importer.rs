use crate::domain::imagefile::ImageFile;
use crate::infrastructure::fs::{ops, scanner};
use crate::infrastructure::media::hashing;
use crate::infrastructure::repo::image_repo;
use crate::state::Db;
use futures::stream::{self, StreamExt};
use std::path::{Path, PathBuf};
use std::sync::Arc;

pub async fn import_directory(source: &str, target: &mut PathBuf, db: &Db) -> Result<(), String> {
  let source_path = Path::new(source);

  target.push("img");

  ops::ensure_dir(target).map_err(|e| e.to_string())?;

  let detected_images = scanner::scan_for_images(source_path);

  let target_path = Arc::new(target.clone());
  let db_handle = db.clone();

  let tasks = stream::iter(detected_images).map(|file| {
    let target_path = Arc::clone(&target_path);

    let db_handle = db_handle.clone();

    async move {
      let mut image_file = ImageFile::default();

      let _ = scanner::extract_metadata(&file, &mut image_file);

      image_file.original_path = file.to_str()?.to_string();

      let file_name = file.file_name()?.to_str()?;

      image_file.filename = file_name.to_string();

      let file_id = hashing::generate_file_id(&file).ok()?;

      let file_ext = file.extension()?.to_str()?.to_string();
      let new_name = format!("{}.{}", file_id, file_ext);
      image_file.image_extension = file_ext;

      let new_path = ops::copy_file(&file, &*target_path, Some(&new_name)).ok()?;
      image_file.path = new_path.to_str()?.to_string();
      image_file.id = file_id;

      let _ = image_repo::save(&db_handle, &image_file);
      Some(())
    }
  });

  tasks.buffer_unordered(50).collect::<Vec<_>>().await;

  Ok(())
}
#[cfg(test)]
mod tests {
  use super::*;
  use sqlx::SqlitePool;
  use std::path::Path;
  use tempfile::tempdir;

  async fn setup_db() -> Db {
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

  fn create_test_image(path: &Path, w: u32, h: u32) {
    let img = image::RgbImage::new(w, h);
    img.save(path).unwrap();
  }

  #[tokio::test]
  async fn imports_images_from_directory() {
    let source_dir = tempdir().unwrap();
    let target_dir = tempdir().unwrap();

    // create files
    let img1 = source_dir.path().join("a.png");
    let img2 = source_dir.path().join("b.jpg");
    let txt = source_dir.path().join("note.txt");

    create_test_image(&img1, 64, 64);
    create_test_image(&img2, 32, 32);
    std::fs::write(&txt, "ignore me").unwrap();

    let mut target = target_dir.path().to_path_buf();
    let img_dir = target.clone();
    let db = setup_db().await;

    import_directory(source_dir.path().to_str().unwrap(), &mut target, &db)
      .await
      .unwrap();

    // 1. img directory created
    let img_dir = img_dir.join("img");
    assert!(img_dir.exists());
    assert!(img_dir.is_dir());

    // 2. files copied
    let copied: Vec<_> = std::fs::read_dir(&img_dir)
      .unwrap()
      .map(|e| e.unwrap().path())
      .collect();

    assert_eq!(copied.len(), 2);

    // 3. db records inserted
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM image_file")
      .fetch_one(&db)
      .await
      .unwrap();

    assert_eq!(count, 2);
  }
}
