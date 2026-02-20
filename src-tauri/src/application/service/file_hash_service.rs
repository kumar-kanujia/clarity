use crate::{
  application::error::AppError, domain::image::Image, infrastructure::processing::hashing,
};

use rayon::iter::{IntoParallelRefMutIterator, ParallelIterator};
use std::panic;

pub fn process_batch(files: &mut [Image]) {
  files
    .par_iter_mut()
    .for_each(|image| match hash_file(image) {
      Ok(hash) => image.update_hash(hash),
      Err(err) => image.mark_hash_error(err.to_string()),
    });
}

fn hash_file(image: &Image) -> Result<Vec<u8>, AppError> {
  let result = panic::catch_unwind(|| hashing::generate_file_hash(&image.path, image.size_bytes));

  match result {
    Ok(inner_res) => Ok(inner_res?),
    Err(panic_payload) => {
      let panic_msg = if let Some(s) = panic_payload.downcast_ref::<&str>() {
        s.to_string()
      } else if let Some(s) = panic_payload.downcast_ref::<String>() {
        s.clone()
      } else {
        "Unknown panic payload type".to_string()
      };

      tracing::error!(
        path = %image.path,
        id = image.id,
        panic_message = %panic_msg,
        "Hash worker panicked while processing file"
      );

      Err(AppError::Unknown)
    }
  }
}
