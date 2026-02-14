pub mod services;
pub mod workers;
pub mod workflow;

// #[tracing::instrument]
// pub async fn list_images_grouped_by_hash(db: &Db) -> Result<Vec<Vec<Image>>, AppError> {
//   let image_files = image_repo::list_images_grouped_by_hash(db).await?;
//   let images = ImageFile::group_by_hash(image_files);
//   Ok(images)
// }
