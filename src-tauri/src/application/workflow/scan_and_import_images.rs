use crate::{
  application::service::{
    file_scan_service::FileScanService, image_import_service::ImageImportService,
  },
  domain::file::FileScanResult,
  error::AppError,
  interface::dtos::image_dto::ImportSummaryDto,
};

pub struct ScanAndImportImages {
  import_service: ImageImportService,
  file_service: FileScanService,
}

impl ScanAndImportImages {
  pub fn new(import_service: ImageImportService, file_service: FileScanService) -> Self {
    Self {
      import_service,
      file_service,
    }
  }

  pub async fn scan_and_import(&self, paths: &[String]) -> Result<ImportSummaryDto, AppError> {
    let file_scan = self.file_service.scan_for_images(paths).await?;

    let metadata = self
      .file_service
      .extract_metadata_for_files(&file_scan.files)
      .await?;
    tracing::error!(?metadata);

    let imported_count = self
      .import_service
      .persist_file_metadata_for_images(&metadata)
      .await?;

    tracing::error!(imported_count);

    Ok(Self::build_summary(
      &file_scan,
      metadata.len(),
      imported_count,
    ))
  }

  fn build_summary(
    scan: &FileScanResult,
    metadata_count: usize,
    imported_count: i64,
  ) -> ImportSummaryDto {
    let metadata_count = metadata_count as i64;
    let extraction_failures = scan.total_files - scan.walk_errors - metadata_count;
    let total_failed = scan.walk_errors + extraction_failures;
    ImportSummaryDto {
      total_scanned: scan.total_files,
      total_imported: imported_count,
      failed: total_failed,
      skipped: metadata_count - imported_count,
    }
  }
}
