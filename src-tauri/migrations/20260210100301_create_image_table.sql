-- Add migration script here
CREATE TABLE IF NOT EXISTS image_file (
    seq_id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    dimension_x INTEGER,
    dimension_y INTEGER
);