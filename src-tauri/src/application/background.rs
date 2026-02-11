use crate::{
  infrastructure::{
    fs::ops,
    media::metadata::create_image_metadata,
    repo::image_repo::{bulk_update_image_files, get_pending_image_file},
  },
  state::Db,
};

use std::{path::PathBuf, time::Duration};

use tauri::{AppHandle, Manager};

pub struct ThumbnailWorker;

impl ThumbnailWorker {
  pub fn spawn(app: &AppHandle, db: Db) {
    let cores = num_cpus::get();
    let batch_size = std::cmp::max(5, cores * 2) as i64;

    let cache_dir = app.path().app_data_dir().unwrap();

    let thumbnail_target = cache_dir.join("org.clarity").join(".thumbnails");

    ops::ensure_dir(&thumbnail_target).unwrap();

    log::info!("Spawning thumbnail worker with {} cores", cores);

    tauri::async_runtime::spawn(async move {
      loop {
        let files = get_pending_image_file(&db, batch_size).await.unwrap();

        if files.is_empty() {
          tokio::time::sleep(Duration::from_secs(2)).await;
          continue;
        }

        log::info!("Got {} files to thumbnail", files.len());

        let mut updated_files = Vec::new();

        for mut file in files {
          log::info!("Thumbnailing {}", file.file_path);
          let file_path = PathBuf::from(&file.file_path);
          let Ok(image_metadata) = create_image_metadata(&file_path, &thumbnail_target) else {
            log::error!("Failed to create metadata for {}", file.file_path);
            file.mark_error();
            updated_files.push(file);
            continue;
          };
          file.update_metadata(image_metadata);
          updated_files.push(file);
        }

        bulk_update_image_files(&db, &updated_files).await.unwrap();
        log::info!("Updated {} files", updated_files.len());
      }
    });
  }
}
