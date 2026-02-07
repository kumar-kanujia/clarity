CREATE TABLE IF NOT EXISTS image_file (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    size_string TEXT,
    dimension_x INTEGER,
    dimension_y INTEGER,
    dimension_string TEXT,
    image_extension TEXT,
    original_path TEXT,
    mean_hash TEXT
);
