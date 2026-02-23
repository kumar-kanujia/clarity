use crate::{
  domain::image::ImageMetadata, infrastructure::processing::error::ProcessingError,
  setup::settings::THUMBNAIL_SIZE,
};

use std::fs::File;
use std::io::BufWriter;
use std::path::Path;

use image::{ImageFormat, ImageReader};
use uuid::Uuid;

pub fn create_image_metadata<P: AsRef<Path>>(
  file: P,
  thumbnail_target: &Path,
) -> Result<ImageMetadata, ProcessingError> {
  let file = file.as_ref();
  let uuid = Uuid::new_v4();

  // Construct path once efficiently
  let thumbnail_path = thumbnail_target.join(format!("{}.webp", uuid));

  let (width, height) = generate_thumbnail(file, &thumbnail_path)?;

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
  let output_file = File::create(target).map_err(ProcessingError::Io)?;

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

#[cfg(test)]
mod tests {
  use super::*;
  use image::{DynamicImage, ImageFormat, RgbImage};
  use std::fs;
  use tempfile::tempdir;

  // Helper to create a tiny valid image file for testing
  fn create_test_image(path: &Path, width: u32, height: u32) {
    let img = DynamicImage::ImageRgb8(RgbImage::new(width, height));
    img.save_with_format(path, ImageFormat::Jpeg).unwrap();
  }

  #[test]
  fn test_generate_thumbnail_success() -> Result<(), Box<dyn std::error::Error>> {
    let dir = tempdir()?;
    let source_path = dir.path().join("input.jpg");
    let target_path = dir.path().join("output.webp");

    // 1. Setup: Create a 100x100 source image
    create_test_image(&source_path, 100, 100);

    // 2. Act
    let (w, h) = generate_thumbnail(&source_path, &target_path)?;

    // 3. Assert
    assert_eq!(w, 100);
    assert_eq!(h, 100);
    assert!(target_path.exists());

    // Verify it's actually a WebP (check magic bytes or try to open)
    let output_img = image::open(&target_path)?;
    assert_eq!(output_img.width(), THUMBNAIL_SIZE); // Assuming THUMBNAIL_SIZE is 200
    Ok(())
  }

  #[test]
  fn test_create_image_metadata_integration() -> Result<(), Box<dyn std::error::Error>> {
    let dir = tempdir()?;
    let source_path = dir.path().join("source.jpg");
    let thumb_dir = dir.path().join("thumbs");
    fs::create_dir(&thumb_dir)?;

    create_test_image(&source_path, 50, 50);

    // Act
    let meta = create_image_metadata(&source_path, &thumb_dir)?;

    // Assert
    assert_eq!(meta.width, 50);
    assert_eq!(meta.height, 50);
    // Verify the path contains a UUID-like string and .webp extension
    assert!(meta.thumbnail_path.ends_with(".webp"));
    assert!(Path::new(&meta.thumbnail_path).exists());

    Ok(())
  }

  #[test]
  fn test_generate_thumbnail_invalid_format() -> Result<(), Box<dyn std::error::Error>> {
    let dir = tempdir()?;
    let txt_file = dir.path().join("not_an_image.txt");
    fs::write(&txt_file, "I am definitely not a JPEG")?;

    let target_path = dir.path().join("fail.webp");

    // Act
    let result = generate_thumbnail(&txt_file, &target_path);

    // Assert
    assert!(matches!(result, Err(ProcessingError::OpenImage { .. })));
    Ok(())
  }
}
