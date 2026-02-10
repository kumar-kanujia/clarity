use crate::domain::dto::{ImportCounters, ImportStatus, ImportSummary};
use crate::infrastructure::fs::{ops, scanner};
use crate::infrastructure::media::hashing;
use crate::infrastructure::repo::image_repo;
use crate::state::Db;

use futures::stream::{self, StreamExt};
use std::io::Error;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::sync::atomic::Ordering;

/// Process a single image file
async fn process_image(file: &Path, app_dir: &Path, db: &Db) -> Result<ImportStatus, Error> {
  let file_id = hashing::generate_file_id(file)?;

  let is_exists = image_repo::check_if_exists(db, &file_id)
    .await
    .map_err(|_| Error::other("Something went wrong!"))?;

  if is_exists {
    return Ok(ImportStatus::Skipped);
  }

  let image_file = scanner::build_image_file_from_path(file, &file_id)?;

  let target_dir = ops::get_file_dir(app_dir, &file_id);

  ops::ensure_dir(&target_dir)?;

  let target_path = target_dir.join(image_file.storage_file_name());

  ops::copy_file_async(file, &target_path).await?;

  image_repo::save(db, &image_file)
    .await
    .map_err(|_| Error::other("Something went wrong!"))?;

  Ok(ImportStatus::Imported)
}

/// Process a list of image files in parallel
async fn process_images_async<I, P>(
  files: I,
  app_dir: &Path,
  db: &Db,
) -> Result<ImportCounters, Error>
where
  I: IntoIterator<Item = P>,
  P: AsRef<Path>,
{
  let counters = Arc::new(ImportCounters::default());

  stream::iter(files)
    .for_each_concurrent(50, |file| {
      let app_dir = app_dir.to_path_buf();
      let counters = counters.clone();

      async move {
        let path = file.as_ref();

        counters.scanned.fetch_add(1, Ordering::Relaxed);

        match process_image(path, &app_dir, db).await {
          Ok(ImportStatus::Imported) => {
            counters.imported.fetch_add(1, Ordering::Relaxed);
          }
          Ok(ImportStatus::Skipped) => {
            counters.skipped.fetch_add(1, Ordering::Relaxed);
          }
          Err(err) => {
            counters.failed.fetch_add(1, Ordering::Relaxed);
            eprintln!("Failed to process {}: {}", path.display(), err);
          }
        }
      }
    })
    .await;
  let final_counters = Arc::try_unwrap(counters).unwrap_or_default();

  Ok(final_counters)
}

/// Process list of paths and import images
pub async fn import_images(
  paths: Vec<PathBuf>,
  app_dir: &Path,
  db: &Db,
) -> Result<ImportSummary, Error> {
  let files: Vec<PathBuf> = paths
    .into_iter()
    .flat_map(|p| scanner::scan_for_image_files(&p))
    .collect();
  let total_files = files.len();
  let mut summary: ImportSummary = process_images_async(files, app_dir, db).await?.into();
  summary.total = total_files;

  Ok(summary)
}
