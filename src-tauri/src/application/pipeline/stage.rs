use std::sync::Arc;
use std::time::Instant;
use std::{fmt, future};

use tokio::sync::Notify;
use tokio_util::sync::CancellationToken;
use tracing::Instrument;

pub trait PipelineStage: Send + Sync + 'static {
  type RawItem: Send + 'static;
  type Item: Send + 'static;
  type Error: fmt::Debug + Send + 'static;

  fn name(&self) -> &'static str;

  fn fetch_batch(
    &self,
    batch_size: usize,
  ) -> impl future::Future<Output = Result<Vec<Self::RawItem>, Self::Error>> + Send;

  fn filter_batch(
    &self,
    items: Vec<Self::RawItem>,
  ) -> impl future::Future<Output = Result<Vec<Self::Item>, Self::Error>> + Send;

  fn process_batch(&self, items: Vec<Self::Item>) -> Vec<Self::Item>;

  fn commit_batch(
    &self,
    items: Vec<Self::Item>,
  ) -> impl future::Future<Output = Result<u64, Self::Error>> + Send;

  fn run(
    self: Arc<Self>,
    notify: Arc<Notify>,
    batch_size: usize,
    cancellation_token: CancellationToken,
  ) -> impl future::Future<Output = ()> + Send {
    let name = self.name();
    let stage_span = tracing::info_span!("pipeline_stage", stage = name);

    async move {
      tracing::info!(batch_size, "Stage started.");
      let mut batch_counter: u64 = 0;

      '_park: loop {
        tokio::select! {
          biased;
          _ = cancellation_token.cancelled() => {
              tracing::info!("Shutdown signal received, exiting stage.");
              return;
          }
          _ = notify.notified() => {}
        }

        'drain: loop {
          if cancellation_token.is_cancelled() {
            tracing::info!("Cancellation detected mid-drain, exiting.");
            return;
          }

          batch_counter += 1;
          let batch_span = tracing::info_span!("batch", stage = name, bid = batch_counter,);
          let start = Instant::now();

          let raw_items = match self
            .fetch_batch(batch_size)
            .instrument(batch_span.clone())
            .await
          {
            Ok(items) => items,
            Err(e) => {
              tracing::error!(error = ?e, "fetch_batch failed, parking stage.");
              break 'drain;
            }
          };

          let raw_count = raw_items.len();

          if raw_count == 0 {
            break 'drain;
          }

          let valid_items = match self
            .filter_batch(raw_items)
            .instrument(batch_span.clone())
            .await
          {
            Ok(items) => items,
            Err(e) => {
              tracing::error!(error = ?e, "filter_batch failed, parking stage.");
              break 'drain;
            }
          };

          if valid_items.is_empty() {
            if raw_count < batch_size {
              break 'drain;
            }
            continue 'drain;
          }

          let stage_clone = Arc::clone(&self);
          let span_clone = batch_span.clone();

          let processed = match tokio::task::spawn_blocking(move || {
            let _enter = span_clone.enter();
            stage_clone.process_batch(valid_items)
          })
          .await
          {
            Ok(items) => items,
            Err(panic) => {
              tracing::error!(error = ?panic, "process_batch panicked, parking stage.");
              Vec::new()
            }
          };

          if processed.is_empty() {
            if raw_count < batch_size {
              break 'drain;
            }
            continue 'drain;
          }

          let processed_count = processed.len();

          match self
            .commit_batch(processed)
            .instrument(tracing::info_span!("commit_batch", stage = name))
            .await
          {
            Ok(committed) => {
              tracing::info!(
                fetched = raw_count,
                processed = processed_count,
                committed,
                duration_ms = start.elapsed().as_millis(),
                "Batch complete.",
              );
            }
            Err(e) => {
              tracing::error!(error = ?e, "commit_batch failed, parking stage.");
              break 'drain;
            }
          }

          if raw_count < batch_size {
            break 'drain;
          }
        }
      }
    }
    .instrument(stage_span)
  }
}
