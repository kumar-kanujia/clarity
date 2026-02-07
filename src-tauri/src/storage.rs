use std::{ffi::OsStr, fs, path::PathBuf};

const IMAGE_FILE_EXTENSIONS: [&str; 6] = ["jpg", "jpeg", "png", "webp", "bmp", "gif"];

fn read_path(path: &PathBuf, files: &mut Vec<PathBuf>) {
  if path.is_dir() {
    for entry in fs::read_dir(path).unwrap() {
      let entry = entry.unwrap();
      let entry_path = entry.path();
      if entry_path.is_file() {
        files.push(entry_path);
      }
    }
  } else if path.is_file() {
    files.push(path.to_path_buf());
  }
}

fn is_path_image(path: &PathBuf) -> bool {
  let mut result = false;
  if path.is_file() {
    let ext = path.extension().unwrap_or(OsStr::new("")).to_str().unwrap();
    result = IMAGE_FILE_EXTENSIONS.contains(&ext);
  }
  result
}

fn read_images(path: &PathBuf) -> Vec<PathBuf> {
  let mut files = Vec::new();
  read_path(&path, &mut files);
  files
    .into_iter()
    .filter(|p| is_path_image(p))
    .collect::<Vec<PathBuf>>()
}

// Save the images to the target path
fn save_images(images: &Vec<PathBuf>, target_path: &PathBuf) {
  for image in images {
    let mut new_path = target_path.to_path_buf();
    new_path.push(image.file_name().unwrap());
    fs::copy(image, new_path).unwrap();
  }
}

// Load the images from the source path and save them to the target path
pub fn load_dir(source: &str, target: &str) {
  let mut target_path = PathBuf::from(target);
  target_path.push("clarity");
  if !target_path.exists() {
    fs::create_dir(target_path.to_path_buf()).unwrap();
  }

  let file_source = PathBuf::from(source);
  let images = read_images(&file_source);
  save_images(&images, &target_path);
}
