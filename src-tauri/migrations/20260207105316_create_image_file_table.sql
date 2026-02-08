CREATE TABLE IF NOT EXISTS image_file (
    file_id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    size INTEGER NOT NULL,
    dimension_x INTEGER,
    dimension_y INTEGER,
    image_extension TEXT,
    original_path TEXT
);
