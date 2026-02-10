-- Add migration script here
CREATE TABLE IF NOT EXISTS image_file (
    seq_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name      TEXT NOT NULL,
    file_path      TEXT NOT NULL,
    thumbnail_path TEXT NOT NULL,
    file_size      INTEGER NOT NULL,
    dimension_x    INTEGER NOT NULL, 
    dimension_y    INTEGER NOT NULL,
    created_at     INTEGER NOT NULL, 
    modified_at    INTEGER NOT NULL
);

CREATE INDEX idx_file_name ON image_file (file_name);
CREATE INDEX idx_file_path ON image_file (file_path);