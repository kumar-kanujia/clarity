-- Add migration script here
CREATE TABLE IF NOT EXISTS image_file (
    seq_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name      TEXT NOT NULL,
    file_path      TEXT NOT NULL,
    thumbnail_path TEXT NOT NULL DEFAULT '',
    file_size      INTEGER NOT NULL DEFAULT 0,
    dim_x          INTEGER NOT NULL DEFAULT 0,
    dim_y          INTEGER NOT NULL DEFAULT 0,
    ctx            INTEGER NOT NULL DEFAULT 0,
    mtx            INTEGER NOT NULL DEFAULT 0,
    imported_at    INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    is_processed   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_file_name ON image_file (file_name);
CREATE INDEX idx_file_path ON image_file (file_path);