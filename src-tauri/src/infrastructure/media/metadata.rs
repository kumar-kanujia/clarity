use std::{fs, io::Error, path::Path, time::UNIX_EPOCH};

use crate::domain::imagemetadata::{FileMetadata, ImageMetadata};

const THUMBNAIL_SIZE: u32 = 256;

fn generate_thumbnail_file(source: &Path, target: &Path) -> Result<(u32, u32), Error> {
  log::info!(
    "Generating thumbnail for {} at {}",
    source.display(),
    target.display()
  );
  let img = image::open(source).map_err(|err| {
    Error::other(format!(
      "Failed to open image: {} {}",
      source.display(),
      err
    ))
  })?;

  let thumbnail = img.thumbnail(THUMBNAIL_SIZE, THUMBNAIL_SIZE);

  thumbnail
    .save(target)
    .map_err(|err| Error::other(format!("Failed to save thumbnail: {}", err)))?;

  let width = img.width();
  let height = img.height();

  Ok((height, width))
}

fn file_metadata(file: &Path) -> Result<FileMetadata, Error> {
  let metadata = fs::metadata(file)?;

  let file_size = metadata.len();

  let modified_at = metadata
    .modified()?
    .duration_since(UNIX_EPOCH)
    .unwrap()
    .as_secs();

  let created_at = metadata
    .created()?
    .duration_since(UNIX_EPOCH)
    .unwrap()
    .as_secs();

  let file_name = file
    .file_name()
    .map(|n| n.to_string_lossy().to_string())
    .unwrap_or_else(|| "unknown".to_string());

  Ok(FileMetadata {
    file_name,
    file_size,
    created_at,
    modified_at,
  })
}

pub fn generate_image_metadata(
  file: &Path,
  thumnail_target: &Path,
) -> Result<ImageMetadata, Error> {
  let file_meta = file_metadata(file)?;

  let uuid = uuid::Uuid::new_v4();
  let thumbnail_path = thumnail_target
    .join(uuid.to_string())
    .with_extension("webp");
  let (height, width) = generate_thumbnail_file(file, &thumbnail_path)?;
  Ok(ImageMetadata {
    file_meta,
    file_path: file.to_string_lossy().to_string(),
    thumbnail_path: thumbnail_path.to_string_lossy().to_string(),
    dimension_x: width,
    dimension_y: height,
  })
}
