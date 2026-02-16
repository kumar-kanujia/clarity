use tracing_subscriber::EnvFilter;
use tracing_subscriber::fmt::format::FmtSpan;
use tracing_subscriber::fmt::time::ChronoLocal;

pub fn init_log() {
  // This allows "info" generally, but suppresses noisy third-party crates
  // unless you explicitly set RUST_LOG=debug.
  let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| "info,sqlx=warn".into());

  // "%H:%M:%S%.3f" -> 14:35:02.123
  // "%Y-%m-%d %H:%M:%S%.3f" -> 2024-02-15 14:35:02.123
  let timer = ChronoLocal::new("%Y-%m-%d %H:%M:%S%.3f".to_string());

  tracing_subscriber::fmt()
    .with_env_filter(filter)
    .with_timer(timer)
    // --- CONTEXT ---
    .with_thread_ids(true) // Show which thread ID is running (e.g., ThreadId(2))
    .with_thread_names(true) // Show thread name (e.g., "tokio-runtime-worker")
    .with_file(true) // Show the filename (e.g., "worker.rs")
    .with_line_number(true) // Show the line number (e.g., 42)
    .with_target(false) // Hide the module path (optional, less noise)
    // --- FORMATTING ---
    // .compact() is good, but .pretty() is often better for local dev.
    // Use .json() if you are sending logs to CloudWatch/Datadog/Grafana.
    .pretty()
    // --- SPAN LIFECYCLE ---
    // This logs when a span CLOSES and tells you how long it was active.
    // Great for seeing: "batch{bid=1}: close time.busy=120ms"
    .with_span_events(FmtSpan::CLOSE)
    .init();
}
