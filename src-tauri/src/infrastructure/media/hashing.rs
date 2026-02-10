use std::{
  fs::File,
  io::{self, Error},
  path::Path,
};

use sha2::{Digest, Sha256};

#[allow(dead_code)]
pub fn generate_file_id(path: &Path) -> Result<String, Error> {
  let mut file = File::open(path)?;
  let mut hasher = Sha256::new();

  io::copy(&mut file, &mut hasher)?;

  Ok(hex::encode(hasher.finalize()))
}
