use crate::infrastructure::fs::{ops, scanner};
use crate::infrastructure::repo::image_repo;
use crate::state::Db;
use futures::future::join_all;
use std::path::{Path, PathBuf};

pub async fn import_directory(source: &str, target: &mut PathBuf, db: &Db) -> Result<(), String> {
  let source_path = Path::new(source);

  target.push("img");

  ops::ensure_dir(target).map_err(|e| e.to_string())?;

  let detected_images = scanner::scan_for_images(source_path);

  let copied_files: Vec<_> = detected_images
    .iter()
    .filter_map(|original| {
      let new_path = ops::copy_file(original, target)?;
      Some((new_path, original))
    })
    .collect();

  let futures = copied_files.into_iter().map(|(new_path, original_path)| {
    let db = db.clone();
    async move {
      if let Ok(image) = scanner::extract_metadata(&new_path, Some(original_path)) {
        let _ = image_repo::save(&db, &image).await;
      }
    }
  });

  join_all(futures).await;

  Ok(())
}
