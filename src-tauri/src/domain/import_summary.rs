#[derive(Debug, Default)]
pub struct ImportSummary {
  /// Total files scanned
  pub selected: i64,

  /// Image Files
  pub discovered: i64,

  /// Processed
  pub processed: i64,

  /// Imported
  pub imported: i64,

  /// Ignored due to duplicates or constraints
  pub skipped: i64,

  /// File not found during metadata extraction
  pub not_found: i64,

  /// Permission denied during metadata extraction
  pub permission_denied: i64,

  /// IO errors during metadata extraction
  pub io_errors: i64,

  /// Filesystem traversal errors
  pub walk_errors: i64,
}

impl ImportSummary {
  pub fn get_failed(&self) -> i64 {
    self.not_found + self.permission_denied + self.io_errors
  }

  pub fn trace_import_summary(&self) {
    tracing::info!(
      selected = self.selected,
      discovered = self.discovered,
      processed = self.processed,
      imported = self.imported,
      skipped = self.skipped,
      metadata_not_found = self.not_found,
      metadata_permission_denied = self.permission_denied,
      metadata_io_errors = self.io_errors,
      walk_errors = self.walk_errors,
      "Import summary"
    );
  }
}
