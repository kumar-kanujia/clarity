use std::{fs, io::Error, path::PathBuf};

use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;

use crate::state::Db;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ImageFile {
  pub id: Option<i32>,
  pub filename: String,
  pub path: String,
  pub size_bytes: u32,
  pub size_string: String,
  pub dimension_x: u32,
  pub dimension_y: u32,
  pub dimension_string: String,
  pub image_extension: String,
  pub original_path: String,
  pub mean_hash: String,
}

impl ImageFile {
  // Get the size of the file in human readable format
  // e.g., "100.0 KB", "1.2 MB", "5.1 GB"
  #[allow(clippy::cast_possible_truncation)]
  fn get_size_string(size_bytes: u32) -> String {
    if size_bytes < 1024 {
      format!("{:.2} KB", size_bytes as f32 / 1000.0) // NOLINT
    } else if size_bytes < 1024 * 1024 {
      format!("{:.2} MB", size_bytes as f32 / 1000.0 / 1000.0)
    } else {
      format!("{:.2} GB", size_bytes as f32 / 1000.0 / 1000.0 / 1000.0)
    }
  }

  fn get_filename(path: &PathBuf) -> String {
    path.file_name().unwrap().to_str().unwrap().to_string()
  }

  fn get_dimension(path: &PathBuf) -> (u32, u32) {
    let dimensions = image::image_dimensions(path).unwrap_or((0, 0));
    (dimensions.0, dimensions.1)
  }

  fn get_dimension_string(dimensions: (u32, u32)) -> String {
    format!("{}x{}", dimensions.0, dimensions.1)
  }

  fn get_file_extension(path: &PathBuf) -> String {
    path
      .extension()
      .and_then(|s| s.to_str())
      .unwrap_or("")
      .to_string()
  }

  pub fn from_path(path: &PathBuf, original_path: Option<&PathBuf>) -> Result<Self, Error> {
    let filename = Self::get_filename(path);
    let size_bytes = fs::metadata(path)?.len() as u32;
    let size_string = Self::get_size_string(size_bytes);
    let dimensions = Self::get_dimension(path);
    let dimension_string = Self::get_dimension_string(dimensions);
    let image_extension = Self::get_file_extension(path);
    let original_path = match original_path {
      Some(original_path) => original_path.to_str().unwrap().to_string(),
      None => "".to_string(),
    };

    let mean_hash = "".to_string();

    Ok(Self {
      id: None,
      filename,
      path: path.to_str().unwrap().to_string(),
      size_bytes,
      size_string,
      dimension_x: dimensions.0,
      dimension_y: dimensions.1,
      dimension_string,
      image_extension,
      original_path,
      mean_hash,
    })
  }

  pub async fn save_db(&self, db: &Db) {
    let sql_str = "INSERT INTO image_file
    (name, path, size_bytes, size_string, dimension_x, dimension_y, dimension_string, image_extension, original_path, mean_hash) 
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)";
    sqlx::query(sql_str)
      .bind(self.filename.clone())
      .bind(self.path.clone())
      .bind(self.size_bytes)
      .bind(self.size_string.clone())
      .bind(self.dimension_x)
      .bind(self.dimension_y)
      .bind(self.dimension_string.clone())
      .bind(self.image_extension.clone())
      .bind(self.original_path.clone())
      .bind(self.mean_hash.clone())
      .execute(db)
      .await
      .unwrap();
  }
}
