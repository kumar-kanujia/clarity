use std::ffi::OsStr;
use std::fs::{self};
use std::io::Error;
use std::path::{Path, PathBuf};

pub fn ensure_dir(path: &Path) -> Result<(), Error> {
  if !path.exists() {
    fs::create_dir_all(path)?;
  }
  Ok(())
}

pub fn get_target_dir(app_dir: &Path, file_id: &str) -> PathBuf {
  let mut target_path = PathBuf::new();
  target_path.push(app_dir);
  target_path.push("img");
  target_path.push(file_id[0..2].to_string());
  target_path.push(file_id[2..4].to_string());
  target_path
}

pub fn get_target_path(file_name: &str, target: &Path) -> String {
  let mut new_path = PathBuf::from(target);
  new_path.push(file_name);
  println!("New Path: {}", target.display());
  new_path.to_str().unwrap().to_string()
}

pub fn copy_file(
  source: &Path,
  target_dir: &Path,
  new_name: Option<&str>,
) -> Result<PathBuf, Error> {
  let file_name = new_name
    .map(OsStr::new)
    .or_else(|| source.file_name())
    .ok_or_else(|| Error::other("Invalid source filename"))?;

  let new_path = target_dir.join(file_name);

  fs::copy(source, &new_path)?;
  Ok(new_path)
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

    let result = copy_file(&source, &target_dir, None).unwrap();

    assert!(result.exists());
    assert_eq!(result.file_name().unwrap(), "source.txt");

    let contents = fs::read_to_string(result).unwrap();
    assert_eq!(contents, "hello world");
  }
}
