use std::fs::File;
use std::io::BufWriter;
use std::path::Path;

use image::{ImageFormat, ImageReader};
use uuid::Uuid;

use crate::{domain::image::ImageMetadata, infrastructure::processing::error::ProcessingError};

/// Thumbnail size in pixels
pub const THUMBNAIL_SIZE: u32 = 256;

pub struct ThumbnailP;

impl ThumbnailP {
  pub fn create_image_metadata<P: AsRef<Path>>(
    file: P,
    thumbnail_target: &Path,
  ) -> Result<ImageMetadata, ProcessingError> {
    let file = file.as_ref();
    let uuid = Uuid::new_v4();

    // Construct path once efficiently
    let thumbnail_path = thumbnail_target.join(format!("{}.webp", uuid));

    let (width, height) = Self::generate_thumbnail(file, &thumbnail_path)?;

    Ok(ImageMetadata {
      thumbnail_path: thumbnail_path.to_string_lossy().into_owned(),
      width,
      height,
    })
  }

  fn generate_thumbnail(source: &Path, target: &Path) -> Result<(i64, i64), ProcessingError> {
    // 1. Use Reader for better error control and format guessing
    let reader = ImageReader::open(source)
      .map_err(|e| ProcessingError::Io(e))?
      .with_guessed_format()
      .map_err(|e| ProcessingError::Io(e))?;

    // 2. Decode the image
    // (Note: This loads the full image. For huge RAW files, this is CPU intensive)
    let img = reader.decode().map_err(|e| ProcessingError::OpenImage {
      path: source.display().to_string(),
      source: e,
    })?;

    let width = img.width() as i64;
    let height = img.height() as i64;

    // 3. Resize (Maintain Aspect Ratio)
    // Uses integer downsampling first for speed, then high-quality filter
    let thumbnail = img.thumbnail(THUMBNAIL_SIZE, THUMBNAIL_SIZE);

    // 4. Save using Buffered Writer
    // CRITICAL OPTIMIZATION: Wrapping file I/O in a buffer significantly reduces syscalls
    let output_file = File::create(target).map_err(|e| ProcessingError::Io(e))?;

    let mut writer = BufWriter::new(output_file);

    // 5. Explicitly write as WebP
    thumbnail
      .write_to(&mut writer, ImageFormat::WebP)
      .map_err(|e| ProcessingError::SaveImage {
        path: target.display().to_string(),
        source: e,
      })?;

    Ok((width, height))
  }
}
