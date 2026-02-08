use std::{
  fs::File,
  io::{Error, Read},
  path::Path,
};

use sha2::{Digest, Sha256};

pub fn generate_file_id(path: &Path) -> Result<String, Error> {
  let mut hasher = Sha256::new();
  let mut buffer = [0; 8192];

  let mut file = File::open(path)?;

  loop {
    let count = file.read(&mut buffer)?;
    if count == 0 {
      break;
    }
    hasher.update(&buffer[..count]);
  }

  let result = hasher.finalize();
  Ok(hex::encode(result))
}
