use std::{io::Error, path::PathBuf};

use crate::{
  domain::dto::Image,
  infrastructure::{fs::ops, repo::image_repo},
  state::Db,
};

pub async fn get_image_files(app_dir: &mut PathBuf, db: &Db) -> Result<Vec<Image>, Error> {
  let Ok(files) = image_repo::get_all_paths(db).await else {
    return Err(Error::other("Something went wrong"));
  };

  let images: Vec<Image> = files
    .into_iter()
    .map(|file| {
      let mut image = Image::from(file);
      image.path = ops::get_image_path(&image.path, app_dir);
      image
    })
    .collect();
  Ok(images)
}
