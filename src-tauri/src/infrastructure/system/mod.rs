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

#[cfg(test)]
mod tests {
  use super::*;
  use chrono::NaiveDate;

  #[test]
  fn test_format_datetime() {
    let dt = NaiveDate::from_ymd_opt(2024, 1, 15)
      .unwrap()
      .and_hms_opt(10, 30, 45)
      .unwrap();
    assert_eq!(format_datetime(dt), "2024-01-15 10:30:45");
  }

  #[test]
  fn test_format_datetime_with_single_digits() {
    let dt = NaiveDate::from_ymd_opt(2024, 1, 5)
      .unwrap()
      .and_hms_opt(9, 5, 3)
      .unwrap();
    assert_eq!(format_datetime(dt), "2024-01-05 09:05:03");
  }

  #[test]
  fn test_format_datetime_midnight() {
    let dt = NaiveDate::from_ymd_opt(2024, 12, 31)
      .unwrap()
      .and_hms_opt(0, 0, 0)
      .unwrap();
    assert_eq!(format_datetime(dt), "2024-12-31 00:00:00");
  }

  #[test]
  fn test_format_datetime_end_of_day() {
    let dt = NaiveDate::from_ymd_opt(2024, 6, 15)
      .unwrap()
      .and_hms_opt(23, 59, 59)
      .unwrap();
    assert_eq!(format_datetime(dt), "2024-06-15 23:59:59");
  }

  #[test]
  fn test_get_utc_timestamp() {
    let timestamp = get_utc_timestamp(time::SystemTime::now());
    assert!(timestamp.len() == 19); // YYYY-MM-DD HH:MM:SS format
    assert!(timestamp.contains("-"));
    assert!(timestamp.contains(":"));
  }

  #[test]
  fn test_get_num_threads_minimum() {
    let num_threads = get_num_threads();
    assert!(num_threads >= 1, "Should always return at least 1 thread");
  }

  #[test]
  fn test_get_num_threads_upper_bound() {
    let num_threads = get_num_threads();
    let physical_cpus = num_cpus::get_physical();
    assert!(num_threads <= physical_cpus, "Should not exceed physical CPU count");
  }

  #[test]
  fn test_get_num_threads_calculation() {
    let num_threads = get_num_threads();
    let physical_cpus = num_cpus::get_physical();
    let expected = physical_cpus.saturating_sub(1).max(1);
    assert_eq!(num_threads, expected);
  }
}