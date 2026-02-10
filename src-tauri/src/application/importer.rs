use crate::domain::dto::{ImportCounters, ImportSummary, ProcessStatus};
use crate::infrastructure::fs::scanner;
use crate::infrastructure::repo::image_repo;
use crate::state::Db;

use futures::stream::{self, StreamExt};
use std::io::Error;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::sync::atomic::Ordering;

async fn process_image(db: &Db, file: &Path) -> Result<ProcessStatus, Error> {
  let file_path = file.to_str().ok_or(Error::other("Invalid file path"))?;

  let is_file_exist = image_repo::check_is_file_exists(db, file_path)
    .await
    .map_err(|_| Error::other("Something went wrong!"))?;

  if is_file_exist {
    return Ok(ProcessStatus::Skipped);
  }

  let image_file = scanner::build_image_file_from_path(file)?;

  image_repo::save_image_file(db, &image_file)
    .await
    .map_err(|_| Error::other("Something went wrong!"))?;

  Ok(ProcessStatus::Processed)
}

/// Process a list of image files in parallel
async fn process_images_async<I, P>(db: &Db, files: I) -> Result<ImportCounters, Error>
where
  I: IntoIterator<Item = P>,
  P: AsRef<Path>,
{
  let counters = Arc::new(ImportCounters::default());

  stream::iter(files)
    .for_each_concurrent(50, |file| {
      let counters = counters.clone();

      async move {
        let file = file.as_ref();

        counters.scanned.fetch_add(1, Ordering::Relaxed);

        match process_image(db, file).await {
          Ok(ProcessStatus::Processed) => {
            counters.imported.fetch_add(1, Ordering::Relaxed);
          }
          Ok(ProcessStatus::Skipped) => {
            counters.skipped.fetch_add(1, Ordering::Relaxed);
          }
          Err(err) => {
            counters.failed.fetch_add(1, Ordering::Relaxed);
            // TODO: Add error handling
            eprintln!("Failed to process {}: {}", file.display(), err);
          }
        }
      }
    })
    .await;
  let final_counters = Arc::try_unwrap(counters).unwrap_or_default();

  Ok(final_counters)
}

/// Process list of paths and import images
pub async fn scan_and_process_images(db: &Db, paths: Vec<PathBuf>) -> Result<ImportSummary, Error> {
  let files: Vec<PathBuf> = paths
    .into_iter()
    .flat_map(|p| scanner::scan_for_image_files(&p))
    .collect();

  let total_files = files.len();
  let mut summary: ImportSummary = process_images_async(db, files).await?.into();
  summary.total = total_files;

  Ok(summary)
}
