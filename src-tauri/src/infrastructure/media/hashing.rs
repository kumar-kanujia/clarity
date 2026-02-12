use std::{fs::File, io::Error, path::Path};

const PARALLEL_THRESHOLD: i64 = 1024 * 1024;

pub fn generate_file_hash<P: AsRef<Path>>(path: P, file_size: i64) -> Result<String, Error> {
  if file_size > PARALLEL_THRESHOLD {
    let mut hasher = blake3::Hasher::new();

    hasher.update_mmap_rayon(&path)?;

    let hash = hasher.finalize();

    Ok(hash.to_hex().to_string())
  } else {
    let mut file = File::open(path)?;

    let mut hasher = blake3::Hasher::new();

    std::io::copy(&mut file, &mut hasher)?;

    Ok(hasher.finalize().to_hex().to_string())
  }
}
