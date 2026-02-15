use crate::{
  infrastructure::{
    models::tag_model::{TagRow, TagType},
    repo::error::DatabaseError,
  },
  setup::state::Db,
};

#[derive(Debug, Clone)]
pub struct TagRepository {
  db: Db,
}

impl TagRepository {
  pub fn new(db: Db) -> Self {
    Self { db }
  }

  pub async fn save_new_tag(&self, text: &str, tag_type: TagType) -> Result<i64, DatabaseError> {
    let query_str = r#"
            INSERT INTO tags (text, tag_type)
            VALUES (?1, ?2)
        "#;
    let result = sqlx::query(query_str)
      .bind(text)
      .bind(tag_type)
      .execute(&self.db)
      .await
      .map_err(|err| match &err {
        sqlx::Error::Database(db_err)
          if matches!(db_err.code().as_deref(), Some("1555") | Some("2067")) =>
        {
          DatabaseError::RecordAlreadyExists(format!("Tag \"{}\"", text))
        }
        _ => DatabaseError::Connection(err),
      })?;

    Ok(result.last_insert_rowid())
  }

  pub async fn list_tags(&self, tag_type: TagType) -> Result<Vec<TagRow>, DatabaseError> {
    let query_str = r#"
            SELECT *
            FROM tags
            WHERE tag_type = ?
        "#;
    let row = sqlx::query_as::<_, TagRow>(query_str)
      .bind(tag_type)
      .fetch_all(&self.db)
      .await?;

    Ok(row)
  }

  pub async fn delete_tag(&self, tag_id: i64, tag_type: TagType) -> Result<(), DatabaseError> {
    let res = sqlx::query("DELETE FROM tags WHERE id = ?1 and tag_type = ?2")
      .bind(tag_id)
      .bind(tag_type)
      .execute(&self.db)
      .await?;

    if res.rows_affected() == 0 {
      return Err(DatabaseError::NotFound(format!(
        "Tag with tag_id: {} not found!",
        tag_id
      )));
    }

    Ok(())
  }
}
