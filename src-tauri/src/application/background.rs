use crate::{
  infrastructure::{
    fs::ops,
    media::metadata::create_image_metadata,
    repo::image_repo::{bulk_update_image_files, get_pending_image_file},
  },
  state::Db,
};

use std::{
  cmp,
  path::PathBuf,
  time::{Duration, Instant},
};

use tauri::{AppHandle, Manager};

pub struct ThumbnailWorker;

impl ThumbnailWorker {
  pub fn get_batch_size() -> i64 {
    cmp::max(5, num_cpus::get() * 2) as i64
  }

  pub fn get_thumbnail_target(app: &AppHandle) -> PathBuf {
    let cache_dir = app.path().app_data_dir().unwrap();
    let target_dir = cache_dir.join("org.clarity").join(".thumbnails");
    ops::ensure_dir(&target_dir).unwrap();
    target_dir
  }

  pub fn spawn(app: &AppHandle, db: Db) {
    let batch_size = Self::get_batch_size();

    let thumbnail_target = Self::get_thumbnail_target(app);

    log::info!(
      "Spawning thumbnail worker with max batch size {}",
      batch_size
    );

    tauri::async_runtime::spawn(async move {
      loop {
        let t0 = Instant::now();
        let files = get_pending_image_file(&db, batch_size).await.unwrap();

        if files.is_empty() {
          tokio::time::sleep(Duration::from_secs(10)).await;
          continue;
        }

        log::info!("Got {} files to thumbnail", files.len());

        let mut tasks = Vec::new();

        for file in files {
          let target_clone = thumbnail_target.clone();
          let task = tauri::async_runtime::spawn_blocking(move || {
            let file_path = PathBuf::from(&file.file_path);

            let result = create_image_metadata(&file_path, &target_clone);
            (file, result)
          });

          tasks.push(task);
        }

        let mut updated_files = Vec::with_capacity(tasks.len());

        for task in tasks {
          if let Ok((mut file, metadata_result)) = task.await {
            match metadata_result {
              Ok(image_metadata) => {
                file.update_metadata(image_metadata);
              }
              Err(_) => {
                log::error!("Failed to create metadata for {}", file.file_path);
                file.mark_error();
              }
            }
            updated_files.push(file);
          }
        }

        bulk_update_image_files(&db, &updated_files).await.unwrap();

        log::info!(
          "Finished thumbnail worker in {:?}",
          t0.elapsed().as_secs_f32()
        );
      }
    });
  }
}
