-- Add migration script here
CREATE TABLE IF NOT EXISTS image_file (
    seq_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path      TEXT NOT NULL UNIQUE,
    file_size      INTEGER NOT NULL CHECK (file_size > 0),
    thumbnail_path TEXT NOT NULL DEFAULT '',
    dim_x          INTEGER NOT NULL DEFAULT 0 CHECK (dim_x >= 0),
    dim_y          INTEGER NOT NULL DEFAULT 0 CHECK (dim_y >= 0),
    process_status   INTEGER NOT NULL DEFAULT 0,
    ctx            INTEGER,
    mtx            INTEGER,
    max_tx         INTEGER GENERATED ALWAYS AS (MAX(IFNULL(ctx, 0), IFNULL(mtx, 0))) VIRTUAL,
    updated_at     INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
    file_hash      BLOB
);

CREATE INDEX IF NOT EXISTS idx_image_file_hash ON image_file (file_hash);
CREATE INDEX IF NOT EXISTS idx_image_file_max_tx_pagination ON image_file (max_tx, seq_id);