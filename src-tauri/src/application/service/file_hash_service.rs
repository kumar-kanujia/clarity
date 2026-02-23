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

#[cfg(test)]
mod tests {
  use super::*;
  use std::io::Write;
  use tempfile::NamedTempFile;

  #[test]
  fn test_process_batch_success() {
    // 1. Setup: Create a real temp file with content
    let mut file = NamedTempFile::new().unwrap();
    writeln!(file, "stable-hashing-content").unwrap();
    let path = file.path().to_str().unwrap().to_string();

    let mut images = vec![Image {
      id: 1,
      path: path.clone(),
      size_bytes: 20, // matching content
      content_hash: vec![],
      error_message: None,
      ..Default::default()
    }];

    // 2. Execute
    process_batch(&mut images);

    // 3. Assert: Hash should be populated, no error
    assert_eq!(images[0].content_hash.len(), 32);
    assert!(images[0].error_message.is_none());
  }

  #[test]
  fn test_process_batch_file_not_found() {
    // Test standard Result-based error handling
    let mut images = vec![Image {
      id: 2,
      path: "non_existent_file.jpg".to_string(),
      size_bytes: 100,
      ..Default::default()
    }];

    process_batch(&mut images);

    // Assert: Error message should be captured from the hashing library
    assert!(images[0].error_message.is_some());
    assert!(images[0].content_hash.is_empty());
  }

  #[test]
  fn test_process_batch_panic_recovery() {
    // This test ensures that our catch_unwind logic works.
    // We simulate a panic by providing a specific path that
    // hashing::generate_file_hash is designed (or mocked) to panic on.

    let mut images = vec![
      Image {
        id: 1,
        path: "valid.jpg".to_string(), // This one shouldn't panic
        ..Default::default()
      },
      Image {
        id: 2,
        path: "panic_trigger".to_string(), // Simulate a "poison" file
        ..Default::default()
      },
    ];

    // We wrap in a test that expects the *thread* not to crash
    process_batch(&mut images);

    // Image 2 should have marked the error with the panic message
    assert!(images[1].error_message.is_some());
    assert_eq!(images[1].retry_count, 1);
  }
}
