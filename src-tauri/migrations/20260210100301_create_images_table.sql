-- Add migration script here
CREATE TABLE IF NOT EXISTS images (
  id              INTEGER PRIMARY KEY,
  file_name       TEXT    NOT NULL,
  path            TEXT    NOT NULL UNIQUE,
  size_bytes      INTEGER NOT NULL CHECK (size_bytes > 0),
  content_hash    BLOB,
  width           INTEGER,
  height          INTEGER,
  thumbnail_path  TEXT,
  status          INTEGER NOT NULL DEFAULT 0,
  retry_count     INTEGER NOT NULL DEFAULT 0,
  error_message   TEXT,
  created_at      TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_favorite     INTEGER NOT NULL DEFAULT 0 CHECK (is_favorite IN (0, 1)),
  is_deleted      INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1))
) STRICT;

CREATE TRIGGER IF NOT EXISTS trg_images_updated_at
AFTER UPDATE ON images
BEGIN
    UPDATE images
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

-- Trigger: Decrement tag counts when an image is sent to the trash

CREATE TRIGGER IF NOT EXISTS trg_image_soft_delete
AFTER UPDATE OF is_deleted ON images
WHEN OLD.is_deleted = 0 AND NEW.is_deleted = 1
BEGIN
    UPDATE tags 
    SET image_count = image_count - 1 
    WHERE id IN (SELECT tag_id FROM image_tags WHERE image_id = NEW.id);
END;

-- Trigger: Increment tag counts when an image is restored from the bin

CREATE TRIGGER IF NOT EXISTS trg_image_restore
AFTER UPDATE OF is_deleted ON images
WHEN OLD.is_deleted = 1 AND NEW.is_deleted = 0
BEGIN
    UPDATE tags 
    SET image_count = image_count + 1 
    WHERE id IN (SELECT tag_id FROM image_tags WHERE image_id = NEW.id);
END;

CREATE INDEX IF NOT EXISTS idx_images_active_pagination 
ON images (created_at DESC, id DESC) 
WHERE is_deleted = 0;

CREATE INDEX IF NOT EXISTS idx_images_work_queue
ON images (status, retry_count, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_images_hash_created_at
ON images (content_hash, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_image_file_name
ON images (file_name);
