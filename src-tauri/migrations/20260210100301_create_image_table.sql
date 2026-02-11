-- Add migration script here
CREATE TABLE IF NOT EXISTS image_file (
    seq_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path      TEXT NOT NULL UNIQUE,
    file_name      TEXT NOT NULL,
    file_size      INTEGER NOT NULL,
    thumbnail_path TEXT NOT NULL DEFAULT '',
    dim_x          INTEGER NOT NULL DEFAULT 0,
    dim_y          INTEGER NOT NULL DEFAULT 0,
    is_processed   INTEGER NOT NULL DEFAULT 0,
    ctx            INTEGER NOT NULL,
    mtx            INTEGER NOT NULL,
    imported_at    INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE INDEX idx_file_path ON image_file (file_path);