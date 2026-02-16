use serde::{Deserialize, Serialize};

pub mod image_dto;
pub mod tag_dto;

#[derive(Serialize, Deserialize, Debug)]
pub enum SearchOrderBy {
  Asc,
  Desc,
}
