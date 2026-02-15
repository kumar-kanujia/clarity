use crate::{
  error::AppError, infrastructure::repo::image_tag::ImageTagRepository, setup::state::Db,
};

pub struct ImageTagService {
  repo: ImageTagRepository,
}

impl ImageTagService {
  pub fn new(db: Db) -> Self {
    Self {
      repo: ImageTagRepository::new(db),
    }
  }

  pub async fn toggle_tag(&self, image_id: i64, tag_id: i64) -> Result<bool, AppError> {
    let mut changed_row = self.repo.insert_tag_image(image_id, tag_id).await?;
    if changed_row == 0 {
      changed_row = self.repo.delete_tag_image(image_id, tag_id).await?;
    }
    Ok(changed_row == 1)
  }
}
