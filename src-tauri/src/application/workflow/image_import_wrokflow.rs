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

    let imported_count = self
      .mutation_service
      .persist_file_metadata_for_images(&files_metadata)
      .await?;

    Ok(ImportSummary::build(
      total_scanned,
      walk_errors,
      files_metadata.len() as i64,
      imported_count,
    ))
  }
}
