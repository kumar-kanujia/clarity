pub mod collection_repo;
pub mod error;
pub mod image_repo;
pub mod image_tag_repo;
pub mod tag_repo;

use sqlx::sqlite::SqliteQueryResult;

use crate::infrastructure::repo::error::DatabaseError;

pub(crate) const NO_LIMIT: i64 = -1;

/// Promotes a query result to `Err(DatabaseError::NotFound)` when no rows
/// were affected, indicating the target record did not exist.
pub fn require_one_affected(result: SqliteQueryResult) -> Result<(), DatabaseError> {
  if result.rows_affected() == 0 {
    Err(DatabaseError::NotFound)
  } else {
    Ok(())
  }
}
