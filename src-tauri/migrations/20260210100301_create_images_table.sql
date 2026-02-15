-- Add migration script here
CREATE TABLE IF NOT EXISTS images (
  id              INTEGER PRIMARY KEY,
  path            TEXT NOT NULL UNIQUE,
  size_bytes      INTEGER NOT NULL CHECK (size_bytes > 0),
  content_hash    BLOB,
  width           INTEGER,
  height          INTEGER,
  thumbnail_path  TEXT,
  status          INTEGER NOT NULL DEFAULT 0,
  retry_count     INTEGER NOT NULL DEFAULT 0,
  error_message   TEXT,
  created_at      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;

CREATE INDEX IF NOT EXISTS idx_images_created_at_id ON images (created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_images_work_queue ON images (status, retry_count);
CREATE INDEX IF NOT EXISTS idx_images_hash_created_at ON images (content_hash, created_at ASC);

CREATE TRIGGER IF NOT EXISTS trg_images_updated_at
AFTER UPDATE ON images
BEGIN
    UPDATE images
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;
