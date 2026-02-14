use crate::{
  domain::file::file_scan::FileMetaData,
  infrastructure::{processing::error::ProcessingError, system::get_utc_timestamp},
};

use std::{
  fs::{self, Metadata},
  path::Path,
  time::{self},
};

// /// Thumbnail size in pixels
// pub const THUMBNAIL_SIZE: u32 = 256;

// fn generate_thumbnail_file<P: AsRef<Path>>(
//   source: P,
//   target: &Path,
// ) -> Result<(u32, u32), ProcessingError> {
//   let img = image::open(&source).map_err(|err| ProcessingError::OpenImage {
//     path: source.as_ref().display().to_string(),
//     source: err,
//   })?;

//   let thumbnail = img.thumbnail(THUMBNAIL_SIZE, THUMBNAIL_SIZE);

//   thumbnail
//     .save(target)
//     .map_err(|err| ProcessingError::SaveImage {
//       path: target.display().to_string(),
//       source: err,
//     })?;

//   let width = img.width();
//   let height = img.height();

//   Ok((width, height))
// }

// pub fn create_image_metadata<P: AsRef<Path>>(
//   file: P,
//   thumnail_target: &Path,
// ) -> Result<ImageMetadata, ProcessingError> {
//   let uuid = Uuid::new_v4();
//   let thumbnail_path = thumnail_target
//     .join(uuid.to_string())
//     .with_extension("webp");

//   let (height, width) = generate_thumbnail_file(file, &thumbnail_path)?;

//   Ok(ImageMetadata {
//     thumbnail_path: thumbnail_path.to_string_lossy().to_string(),
//     dim_x: width,
//     dim_y: height,
//   })
// }

pub struct MetadataP;

impl MetadataP {
  fn get_metadata(file: &Path) -> Result<Metadata, ProcessingError> {
    fs::metadata(file).map_err(|e| match e.kind() {
      std::io::ErrorKind::NotFound => ProcessingError::NotFound(file.display().to_string()),
      std::io::ErrorKind::PermissionDenied => {
        ProcessingError::PermissionDenied(file.display().to_string())
      }
      _ => ProcessingError::Io(e),
    })
  }

  fn extract_created_at(metadata: Metadata) -> String {
    let system_time = metadata
      .created()
      .or_else(|_| metadata.modified())
      .unwrap_or(time::SystemTime::now());
    get_utc_timestamp(system_time)
  }

  pub fn get_file_metadata(file: &Path) -> Result<FileMetaData, ProcessingError> {
    let metadata = Self::get_metadata(file)?;
    let path = file.to_string_lossy().to_string();
    let size_bytes = metadata.len() as i64;
    if size_bytes == 0 {
      return Err(ProcessingError::EmptyFile(path));
    }
    let created_at = Self::extract_created_at(metadata);
    Ok(FileMetaData {
      path,
      size_bytes,
      created_at,
    })
  }
}
