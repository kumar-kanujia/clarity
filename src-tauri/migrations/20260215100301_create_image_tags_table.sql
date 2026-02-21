-- Add migration script here
CREATE TABLE IF NOT EXISTS image_tags (
  image_id        INTEGER   NOT NULL,
  tag_id          INTEGER   NOT NULL,
  created_at      TEXT      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY     (image_id, tag_id),
  FOREIGN KEY     (image_id)         REFERENCES images(id) ON DELETE CASCADE,
  FOREIGN KEY     (tag_id)           REFERENCES tags(id) ON DELETE CASCADE
) STRICT;


-- Trigger: Increment tag count when image is tagged while checking it's not in bin

CREATE TRIGGER IF NOT EXISTS trg_image_tags_insert
AFTER INSERT ON image_tags
FOR EACH ROW
WHEN (SELECT is_deleted FROM images WHERE id = NEW.image_id) = 0
BEGIN
  UPDATE tags
  SET image_count = image_count + 1
  WHERE id = NEW.tag_id;
END;

-- Trigger: Decrement tag count when image is untagged while checking it's not in bin

CREATE TRIGGER IF NOT EXISTS trg_image_tags_delete
AFTER DELETE ON image_tags
FOR EACH ROW
WHEN (SELECT is_deleted FROM images WHERE id = OLD.image_id) = 0
BEGIN
  UPDATE tags
  SET image_count = image_count - 1
  WHERE id = OLD.tag_id;
END;


-- Trigger: Decrement tag counts when an image is sent to the bin

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

CREATE INDEX IF NOT EXISTS idx_image_tags_tag_created 
ON image_tags (tag_id, created_at DESC, image_id DESC);
