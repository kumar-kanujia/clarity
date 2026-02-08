use std::fs;
use std::io::Error;
use std::path::{Path, PathBuf};

pub fn ensure_dir(path: &Path) -> Result<(), Error> {
  if !path.exists() {
    fs::create_dir_all(path)?;
  }
  Ok(())
}

pub fn copy_file(source: &Path, target_dir: &Path) -> Result<PathBuf, Error> {
  if let Some(file_name) = source.file_name() {
    let new_path = target_dir.join(file_name);
    if fs::copy(source, &new_path).is_ok() {
      return Ok(new_path);
    }
  }
  Err(Error::other("File not found"))
}

#[cfg(test)]
mod ensure_dir_tests {
  use super::*;
  use tempfile::tempdir;

  #[test]
  fn creates_directory_when_missing() {
    let temp = tempdir().unwrap();
    let dir = temp.path().join("images");

    assert!(!dir.exists());

    ensure_dir(&dir).unwrap();

    assert!(dir.exists());
    assert!(dir.is_dir());
  }

  #[test]
  fn succeeds_when_directory_already_exists() {
    let temp = tempdir().unwrap();
    let dir = temp.path().join("existing");

    fs::create_dir(&dir).unwrap();

    ensure_dir(&dir).unwrap();
    assert!(dir.exists());
  }
}

#[cfg(test)]
mod copy_file_tests {
  use super::*;
  use std::fs;
  use tempfile::tempdir;

  #[test]
  fn copies_file_and_returns_new_path() {
    let temp = tempdir().unwrap();

    let source = temp.path().join("source.txt");
    fs::write(&source, "hello world").unwrap();

    let target_dir = temp.path().join("target");
    fs::create_dir(&target_dir).unwrap();

    let result = copy_file(&source, &target_dir).unwrap();

    assert!(result.exists());
    assert_eq!(result.file_name().unwrap(), "source.txt");

    let contents = fs::read_to_string(result).unwrap();
    assert_eq!(contents, "hello world");
  }
}
