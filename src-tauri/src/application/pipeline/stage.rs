use std::sync::Arc;
use std::time::Instant;
use std::{fmt, future};

use tokio::sync::Notify;
use tokio_util::sync::CancellationToken;
use tracing::Instrument;

pub trait PipelineStage: Send + Sync + 'static {
  type Item: Send + 'static;
  type Error: fmt::Debug + Send + 'static;

  fn name(&self) -> &'static str;

  fn fetch_batch(
    &self,
    batch_size: usize,
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

      loop {
        tokio::select! {
            _ = cancellation_token.cancelled() => {
                tracing::info!("Shutdown signal received, exiting stage safely.");
                return;
            }
            _ = notify.notified() => {}
        }

        loop {
          batch_counter += 1;
          let batch_span = tracing::info_span!("batch", stage = name, bid = batch_counter,);
          let start = Instant::now();

          let items = match self
            .fetch_batch(batch_size)
            .instrument(tracing::info_span!("fetch_batch", stage = name))
            .await
          {
            Ok(items) => items,
            Err(e) => {
              tracing::error!(error = ?e, "fetch_batch failed, parking stage.");
              break;
            }
          };

          let fetched_count = items.len();

          let stage_clone = Arc::clone(&self);

          let processed = tokio::task::spawn_blocking(move || {
            let _enter = batch_span.enter();
            stage_clone.process_batch(items)
          })
          .await
          .unwrap_or_else(|e| {
            tracing::error!(error = ?e, "process_batch panicked");
            Vec::new()
          });

          if !processed.is_empty() {
            let processed_count = processed.len();

            match self
              .commit_batch(processed)
              .instrument(tracing::info_span!("commit_batch", stage = name))
              .await
            {
              Ok(committed) => {
                tracing::info!(
                  fetched = fetched_count,
                  processed = processed_count,
                  committed,
                  duration_ms = start.elapsed().as_millis(),
                  "Batch complete.",
                );
              }
              Err(e) => {
                tracing::error!(error = ?e, "commit_batch failed, parking stage.");
                break;
              }
            }
          }

          if fetched_count < batch_size {
            break;
          }
        }
      }
    }
    .instrument(stage_span)
  }
}
