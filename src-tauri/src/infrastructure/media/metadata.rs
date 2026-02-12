use crate::{
  domain::{filemetadata::FileMetadata, imagemetadata::ImageMetadata},
  infrastructure::media::error::{ImageMetadataError, MetadataError, ThumbnailError},
  state::THUMBNAIL_SIZE,
};

use std::{
  fs,
  path::{Path, PathBuf},
  time::UNIX_EPOCH,
};

use futures::stream::StreamExt;

pub struct MetadataStats {
  pub metadata: Vec<FileMetadata>,
  pub not_found: usize,
  pub permission_denied: usize,
  pub io_errors: usize,
}

fn generate_thumbnail_file(source: &Path, target: &Path) -> Result<(u32, u32), ThumbnailError> {
  let img = image::open(source).map_err(|err| ThumbnailError::Open {
    path: source.display().to_string(),
    source: err,
  })?;

  let thumbnail = img.thumbnail(THUMBNAIL_SIZE, THUMBNAIL_SIZE);

  thumbnail.save(target).map_err(|err| ThumbnailError::Save {
    path: target.display().to_string(),
    source: err,
  })?;

  let width = img.width();
  let height = img.height();

  Ok((width, height))
}

pub fn create_image_metadata(
  file: &Path,
  thumnail_target: &Path,
) -> Result<ImageMetadata, ImageMetadataError> {
  let uuid = uuid::Uuid::new_v4();
  let thumbnail_path = thumnail_target
    .join(uuid.to_string())
    .with_extension("webp");

  let (height, width) = generate_thumbnail_file(file, &thumbnail_path)?;

  Ok(ImageMetadata {
    thumbnail_path: thumbnail_path.to_string_lossy().to_string(),
    dim_x: width,
    dim_y: height,
  })
}

pub fn create_file_metadata(file: &Path) -> Result<FileMetadata, MetadataError> {
  let metadata = fs::metadata(file).map_err(|e| match e.kind() {
    std::io::ErrorKind::NotFound => MetadataError::NotFound(file.display().to_string()),
    std::io::ErrorKind::PermissionDenied => {
      MetadataError::PermissionDenied(file.display().to_string())
    }
    _ => MetadataError::Io(e.to_string()),
  })?;

  let file_path = file.to_string_lossy().to_string();

  let file_name = file.file_name().map_or_else(
    || "unknown".to_string(),
    |n| n.to_string_lossy().to_string(),
  );

  let file_size = metadata.len();

  let mtx = metadata
    .modified()
    .ok()
    .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
    .map(|d| d.as_secs());

  let ctx = metadata
    .created()
    .ok()
    .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
    .map(|d| d.as_secs());

  Ok(FileMetadata {
    file_path,
    file_name,
    file_size,
    ctx,
    mtx,
  })
}

pub async fn extract_metadata_parallel(files: Vec<PathBuf>) -> MetadataStats {
  let concurrency = (num_cpus::get() * 2).min(32);

  let results = futures::stream::iter(files)
    .map(|path| tokio::task::spawn_blocking(move || create_file_metadata(&path)))
    .buffer_unordered(concurrency)
    .collect::<Vec<_>>()
    .await;

  let mut metadata = Vec::new();

  let mut not_found = 0;
  let mut permission_denied = 0;
  let mut io_errors = 0;

  for res in results {
    match res {
      Ok(Ok(meta)) => metadata.push(meta),
      Ok(Err(err)) => match err {
        MetadataError::NotFound(_) => not_found += 1,
        MetadataError::PermissionDenied(_) => permission_denied += 1,
        MetadataError::Io(_) => io_errors += 1,
      },
      Err(_) => io_errors += 1,
    }
  }

  MetadataStats {
    metadata,
    not_found,
    permission_denied,
    io_errors,
  }
}
