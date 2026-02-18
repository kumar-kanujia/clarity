pub mod image_dto;
pub mod tag_dto;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub enum SearchOrderBy {
  Asc,
  Desc,
}
