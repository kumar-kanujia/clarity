use crate::{domain::image::Image, infrastructure::processing::hashing};

use rayon::iter::{IntoParallelRefMutIterator, ParallelIterator};
use std::panic;

#[derive(Debug)]
pub struct FileHashService;

impl FileHashService {
  pub fn process_batch(files: &mut [Image]) {
    files
      .par_iter_mut()
      .for_each(|image| match Self::hash_file(image) {
        Ok(hash) => image.update_hash(hash),
        Err(err) => image.mark_hash_error(err),
      });
  }

  fn hash_file(image: &Image) -> Result<Vec<u8>, String> {
    panic::catch_unwind(|| hashing::generate_file_hash(&image.path, image.size_bytes))
      .map_err(|_| {
        tracing::error!(path=%image.path, id=image.id, "Hash panicked");
        "hash_file panicked".to_string()
      })?
      .map_err(|e| {
        tracing::error!(path=%image.path, id=image.id, error=%e);
        e.to_string()
      })
  }
}
