CREATE TABLE IF NOT EXISTS image_file (
    seq_id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id TEXT NOT NULL UNIQUE,
    filename TEXT NOT NULL,
    size INTEGER NOT NULL,
    dimension_x INTEGER,
    dimension_y INTEGER,
    image_extension TEXT,
    original_path TEXT
);