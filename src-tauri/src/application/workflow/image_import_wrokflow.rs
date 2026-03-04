use crate::{
  application::{
    error::AppError,
    service::{file_scan_service, image_mutation_service::ImageMutationService},
  },
  interface::dtos::image_dto::ImportSummary,
};

pub struct ImageImportWorkflow {
  mutation_service: ImageMutationService,
}

impl ImageImportWorkflow {
  pub fn new(mutation_service: ImageMutationService) -> Self {
    Self { mutation_service }
  }

  pub async fn scan_and_import_images(&self, paths: &[String]) -> Result<ImportSummary, AppError> {
    let file_scan_summary = file_scan_service::scan_paths_for_images(paths).await?;

    let total_scanned = file_scan_summary.total_files;
    let walk_errors = file_scan_summary.walk_errors;

    if total_scanned == 0 {
      return Ok(ImportSummary::build(total_scanned, walk_errors, 0, 0));
    }

    let files_metadata =
      file_scan_service::extract_metadata_for_files(file_scan_summary.files).await?;

    let imported_images = self
      .mutation_service
      .persist_file_metadata_for_images(&files_metadata)
      .await?;

    Ok(ImportSummary::build(
      total_scanned,
      walk_errors,
      files_metadata.len() as i64,
      imported_images as i64,
    ))
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::{infrastructure::repo::image_repo::ImageRepository, tests::utils::setup_test_db};
  use std::{fs::File, io::Write};
  use tempfile::tempdir;

  async fn setup() -> (ImageImportWorkflow, sqlx::SqlitePool) {
    let pool = setup_test_db().await;
    let mutation_service = ImageMutationService::new(ImageRepository::new(pool.clone()));
    (ImageImportWorkflow::new(mutation_service), pool)
  }

  #[tokio::test]
  async fn test_full_import_workflow() {
    let (workflow, pool) = setup().await;
    let temp_dir = tempdir().unwrap();
    let root = temp_dir.path();

    // 1. Create files with valid "Magic Bytes"
    // Minimal JPEG header
    let mut jpg = File::create(root.join("photo1.jpg")).unwrap();
    jpg.write_all(&[0xFF, 0xD8, 0xFF, 0xDB]).unwrap();

    // Minimal PNG header
    let mut png = File::create(root.join("photo2.png")).unwrap();
    png
      .write_all(&[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
      .unwrap();

    // A real PDF (or empty) should be ignored by the image scanner
    File::create(root.join("document.pdf")).unwrap();

    let scan_paths = vec![root.to_string_lossy().to_string()];

    // 2. Execute
    let result = workflow.scan_and_import_images(&scan_paths).await.unwrap();

    // 3. Assert Summary
    // Note: total_scanned depends on if your scanner counts all files or just hits
    assert_eq!(result.total_scanned, 3);
    assert_eq!(result.total_imported, 2);
    assert_eq!(result.skipped, 0);
    assert_eq!(result.failed, 1);

    // 4. Verify Database
    let db_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM images")
      .fetch_one(&pool)
      .await
      .unwrap();
    assert_eq!(db_count, 2);
  }

  #[tokio::test]
  async fn test_import_workflow_empty_paths() {
    let (workflow, _) = setup().await;

    // Should handle empty input gracefully without errors
    let result = workflow.scan_and_import_images(&[]).await.unwrap();

    assert_eq!(result.total_scanned, 0);
    assert_eq!(result.total_imported, 0);
  }
}
