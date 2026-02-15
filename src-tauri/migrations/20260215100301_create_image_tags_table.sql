-- Add migration script here
CREATE TABLE IF NOT EXISTS image_tags (
  image_id        INTEGER   NOT NULL,
  tag_id          INTEGER   NOT NULL,
  created_at      TEXT      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY     (image_id, tag_id),
  FOREIGN KEY     (image_id)         REFERENCES images(id) ON DELETE CASCADE,
  FOREIGN KEY     (tag_id)           REFERENCES tags(id) ON DELETE CASCADE
) STRICT;

CREATE TRIGGER IF NOT EXISTS trg_image_tags_insert
AFTER INSERT ON image_tags
FOR EACH ROW
BEGIN
  UPDATE tags
  SET image_count = image_count + 1
  WHERE id = NEW.tag_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_image_tags_delete
AFTER DELETE ON image_tags
FOR EACH ROW
BEGIN
  UPDATE tags
  SET image_count = image_count - 1
  WHERE id = OLD.tag_id;
END;


CREATE INDEX IF NOT EXISTS idx_image_tags_tag_id
ON image_tags (tag_id, image_id);
