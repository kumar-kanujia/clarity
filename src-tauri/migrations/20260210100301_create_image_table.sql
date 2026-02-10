-- Add migration script here
CREATE TABLE IF NOT EXISTS image_file (
    seq_id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    dimension_x INTEGER,
    dimension_y INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);