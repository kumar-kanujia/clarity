use crate::infrastructure::processing::error::ProcessingError;

use std::{fs::File, io::BufReader, path::Path};

const PARALLEL_THRESHOLD_SIZE: i64 = 20 * 1024 * 1024;
const FILE_BUFFER_CAPACITY: usize = 128 * 1024;

pub fn generate_file_hash<P: AsRef<Path>>(
  path: P,
  file_size: i64,
) -> Result<Vec<u8>, ProcessingError> {
  if file_size > PARALLEL_THRESHOLD_SIZE {
    let mut hasher = blake3::Hasher::new();

    hasher.update_mmap_rayon(&path)?;

    let hash = hasher.finalize();

    Ok(hash.as_bytes().to_vec())
  } else {
    let file = File::open(path)?;

    let mut reader = BufReader::with_capacity(FILE_BUFFER_CAPACITY, file);
    let mut hasher = blake3::Hasher::new();

    std::io::copy(&mut reader, &mut hasher)?;

    let hash = hasher.finalize();

    Ok(hash.as_bytes().to_vec())
  }
}
