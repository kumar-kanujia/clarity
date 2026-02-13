use std::time;

pub fn get_unix_timestamp() -> i64 {
  std::time::SystemTime::now()
    .duration_since(time::UNIX_EPOCH)
    .unwrap()
    .as_secs() as i64
}
