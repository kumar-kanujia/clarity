use crate::infrastructure::fs::error::FSError;

use std::fs::{self, File};
use std::io::ErrorKind;
use std::path::Path;

pub fn delete_file<P: AsRef<Path>>(path: P) -> Result<(), FSError> {
  fs::remove_file(path)?;
  Ok(())
}

pub fn ensure_dir(path: &Path) -> Result<(), FSError> {
  fs::create_dir_all(path)?;
  Ok(())
}

pub fn is_file_readable<P: AsRef<Path>>(path: P) -> Result<(), FSError> {
  let path_ref = path.as_ref();

  match File::open(path_ref) {
    Ok(_) => Ok(()),
    Err(e) => {
      // We convert the path to a string only when an error actually occurs
      let path_str = path_ref.display().to_string();
      match e.kind() {
        ErrorKind::NotFound => Err(FSError::FileNotFound(path_str)),
        ErrorKind::PermissionDenied => Err(FSError::PermissionDenied(path_str)),
        _ => Err(FSError::Io(e)),
      }
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use std::fs::{self, File};
  use std::io::Write;
  use tempfile::tempdir;

  #[test]
  fn test_ensure_dir_creates_nested_path() -> Result<(), Box<dyn std::error::Error>> {
    let tmp = tempdir()?;
    let nested_path = tmp.path().join("a/b/c");

    // Act
    ensure_dir(&nested_path)?;

    // Assert
    assert!(nested_path.exists());
    assert!(nested_path.is_dir());
    Ok(())
  }

  #[test]
  fn test_is_file_readable_success() -> Result<(), Box<dyn std::error::Error>> {
    let tmp = tempdir()?;
    let file_path = tmp.path().join("test.txt");
    File::create(&file_path)?.write_all(b"hello")?;

    let path_str = file_path.to_str().unwrap();

    // Act & Assert
    assert!(is_file_readable(path_str).is_ok());
    Ok(())
  }

  #[test]
  fn test_is_file_readable_not_found() {
    let result = is_file_readable("/path/to/nothing/at/all/ever");

    match result {
      Err(FSError::FileNotFound(p)) => assert!(p.contains("nothing")),
      _ => panic!("Expected FileNotFound error, got {:?}", result),
    }
  }

  #[test]
  #[cfg(unix)] // Permission tests are easier to simulate on Unix-like systems
  fn test_is_file_readable_permission_denied() -> Result<(), Box<dyn std::error::Error>> {
    use std::os::unix::fs::PermissionsExt;

    let tmp = tempdir()?;
    let file_path = tmp.path().join("secret.txt");
    let mut file = File::create(&file_path)?;
    file.write_all(b"secret data")?;

    // Remove all permissions (000)
    let mut perms = fs::metadata(&file_path)?.permissions();
    perms.set_mode(0o000);
    fs::set_permissions(&file_path, perms)?;

    let path_str = file_path.to_str().unwrap();
    let result = is_file_readable(path_str);

    // Assert
    assert!(matches!(result, Err(FSError::PermissionDenied(_))));

    // Cleanup: Reset permissions so tempdir can delete itself
    let mut reset_perms = fs::metadata(&file_path)?.permissions();
    reset_perms.set_mode(0o644);
    fs::set_permissions(&file_path, reset_perms)?;

    Ok(())
  }

  #[test]
  fn test_is_file_readable_with_pathbuf() -> Result<(), Box<dyn std::error::Error>> {
    let tmp = tempdir()?;
    let file_path = tmp.path().join("test.txt");
    File::create(&file_path)?;

    // No need to convert to &str anymore!
    assert!(is_file_readable(file_path).is_ok());
    Ok(())
  }
}
