use std::{fs::metadata, io::Error, path::PathBuf};

use image::ImageReader;
use serde::Serialize;

#[derive(Serialize, Default)]
pub struct ImageFile {
  pub name: String,
  pub path: String,
  pub size_bytes: u64,
  pub width: Option<u32>,
  pub height: Option<u32>,
}

impl ImageFile {
  pub fn from_path(path_buf: &PathBuf) -> Result<Self, Error> {
    let name = path_buf
      .file_name()
      .unwrap()
      .to_str()
      .unwrap_or_default()
      .to_string();

    let path = path_buf.display().to_string();

    let size = metadata(path_buf).map(|m| m.len()).unwrap_or(0);

    let (width, height) = ImageReader::open(path_buf)
      .ok()
      .and_then(|reader| reader.into_dimensions().ok())
      .map(|(w, h)| (Some(w), Some(h)))
      .unwrap_or((None, None));

    Ok(Self {
      name,
      path,
      size_bytes: size,
      width,
      height,
    })
  }
}
