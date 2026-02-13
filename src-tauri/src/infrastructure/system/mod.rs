use std::time;

use chrono::{DateTime, Utc};

pub fn get_unix_timestamp() -> i64 {
  time::SystemTime::now()
    .duration_since(time::UNIX_EPOCH)
    .unwrap()
    .as_secs() as i64
}

pub fn get_utc_timestamp(time: time::SystemTime) -> String {
  let datetime: DateTime<Utc> = time.into();
  datetime.format("%Y-%m-%d %H:%M:%S").to_string()
}
