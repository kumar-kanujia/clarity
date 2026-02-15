-- Add migration script here
CREATE TABLE IF NOT EXISTS tags (
  id              INTEGER   PRIMARY KEY,
  text            TEXT      NOT NULL COLLATE NOCASE UNIQUE,
  color           TEXT      NOT NULL DEFAULT '#808080' CHECK(length(color) = 7 AND substr(color,1,1) = '#'),
  image_count     INTEGER   NOT NULL DEFAULT 0,
  tag_type        TEXT      NOT NULL DEFAULT 'user',
  is_deleted      INTEGER   NOT NULL DEFAULT 0,
  is_hidden       INTEGER   NOT NULL DEFAULT 0,
  created_at      TEXT      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TEXT      NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;


CREATE TRIGGER IF NOT EXISTS trg_tags_updated_at
AFTER UPDATE ON tags
BEGIN
    UPDATE tags
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_prevent_system_tag_delete
BEFORE DELETE ON tags
FOR EACH ROW
WHEN OLD.tag_type = 'system'
BEGIN
    SELECT RAISE(ABORT, 'Cannot delete system tag');
END;

CREATE TRIGGER IF NOT EXISTS trg_prevent_system_tag_rename
BEFORE UPDATE OF text ON tags
FOR EACH ROW
WHEN OLD.tag_type = 'system'
BEGIN
    SELECT RAISE(ABORT, 'Cannot rename system tag');
END;

CREATE INDEX IF NOT EXISTS idx_tags_image_count
ON tags(image_count DESC);

INSERT INTO tags (text, color, tag_type)
VALUES
  ('favorite', '#FFD700', 'system'),
  ('bin',      '#FF3B30', 'system')
ON CONFLICT(text) DO NOTHING;
