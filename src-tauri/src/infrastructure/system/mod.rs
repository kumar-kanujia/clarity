use std::time;

use chrono::{DateTime, NaiveDateTime, Utc};

pub fn format_datetime(dt: NaiveDateTime) -> String {
  dt.format("%Y-%m-%d %H:%M:%S").to_string()
}

pub fn get_utc_timestamp(time: time::SystemTime) -> String {
  let datetime: DateTime<Utc> = time.into();
  format_datetime(datetime.naive_local())
}

pub fn get_num_threads() -> usize {
  num_cpus::get_physical().saturating_sub(1).max(1)
}
