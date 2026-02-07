use std::{
  fs,
  io::{Error, ErrorKind},
  path::{Path, PathBuf},
};

use crate::state::Db;

const IMAGE_FILE_EXTENSIONS: [&str; 6] = ["jpg", "jpeg", "png", "webp", "bmp", "gif"];

fn read_path(path: &PathBuf, files: &mut Vec<PathBuf>) -> Result<(), Error> {
  if path.is_dir() {
    let Ok(file_entires) = fs::read_dir(path) else {
      return Err(Error::new(ErrorKind::InvalidFilename, "Incorrect File"));
    };

    file_entires.for_each(|file| {
      if let Ok(file) = file {
        let file_path = file.path();
        if file_path.is_file() {
          files.push(file_path);
        }
      }
    });
  } else if path.is_file() {
    files.push(path.clone());
  }
  Ok(())
}

fn is_path_image(path: &Path) -> bool {
  if path.is_file()
    && let Some(extension) = path.extension()
    && let Some(extension) = extension.to_str()
  {
    return IMAGE_FILE_EXTENSIONS.contains(&extension);
  }
  false
}

fn read_images(path: &PathBuf) -> Vec<PathBuf> {
  let mut files = Vec::new();
  if let Err(err) = read_path(path, &mut files) {
    // TODO: Handle error
    println!("Error read_images: {err}");
  }
  files
    .into_iter()
    .filter(|file| is_path_image(file.as_path()))
    .collect()
}

// Save the images to the target path
fn save_files(files: &[PathBuf], target_path: &Path) -> Vec<PathBuf> {
  let mut saved_files = Vec::new();
  if target_path.exists() {
    for file in files {
      {
        let mut new_path = target_path.to_path_buf();
        if let Some(file_name) = file.file_name() {
          new_path.push(file_name);
          if let Ok(_) = fs::copy(file, &new_path) {
            saved_files.push(new_path);
          }
        }
      }
    }
  }
  saved_files
}

fn set_storage_path(target_path: &mut PathBuf) -> Result<(), Error> {
  target_path.push("img");
  if !target_path.exists() {
    fs::create_dir_all(&target_path)?;
  }
  Ok(())
}

pub async fn save_files_db(saved_files: Vec<PathBuf>, db: &Db) {
  for saved_file in saved_files {
    sqlx::query("INSERT INTO image_files (name, path) VALUES (?1, ?2)")
      .bind(saved_file.file_name().unwrap().to_str().unwrap())
      .bind(saved_file.as_path().to_str().unwrap())
      .execute(db)
      .await
      .unwrap();
  }
}

// Load the images from the source path and save them to the target path
pub fn load_dir(source: &str, target: &str) -> Vec<PathBuf> {
  let source_path = PathBuf::from(source);
  let mut target_path = PathBuf::from(target);

  let rs = set_storage_path(&mut target_path);
  if let Err(e) = rs {
    println!("Error set_storage_path: {e}");
  }
  println!("Storage path: {:?}", target_path.display());
  let images = read_images(&source_path);

  save_files(&images, &target_path)
}
