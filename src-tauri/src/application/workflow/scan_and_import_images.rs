use crate::{
  application::service::{
    file_scan_service::FileScanService, image_import_service::ImageImportService,
  },
  domain::file::FileScanResult,
  error::AppError,
  infrastructure::repo::image_repo::ImageRepository,
  interface::dto::ImportSummaryDto,
  setup::state::Db,
};

pub struct ScanAndImportImages {
  import_service: ImageImportService,
}

impl ScanAndImportImages {
  pub fn new(db: Db) -> Self {
    Self {
      import_service: ImageImportService::new(ImageRepository::new(db)),
    }
  }

  pub async fn run(&self, paths: &[String]) -> Result<ImportSummaryDto, AppError> {
    let file_scan = FileScanService::scan_for_images(paths).await?;

    let metadata = FileScanService::extract_metadata_for_files(&file_scan.files).await?;

    let imported_count = self
      .import_service
      .persist_file_metadata_for_images(&metadata)
      .await?;

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
