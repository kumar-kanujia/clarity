use std::time;

use chrono::{DateTime, NaiveDateTime, Utc};

pub fn get_unix_timestamp() -> u64 {
  time::SystemTime::now()
    .duration_since(time::UNIX_EPOCH)
    .unwrap()
    .as_secs()
}

pub fn format_datetime(dt: NaiveDateTime) -> String {
  dt.format("%Y-%m-%d %H:%M:%S").to_string()
}

pub fn get_utc_timestamp(time: time::SystemTime) -> String {
  let datetime: DateTime<Utc> = time.into();
  format_datetime(datetime.naive_local())
}

pub fn get_cpu_cap() -> usize {
  num_cpus::get() * 2
}

pub fn get_num_threads() -> usize {
  num_cpus::get_physical().saturating_sub(1).max(1)
}
