# CAPABILITIES.md

## Implemented Capabilities

---

### Image Discovery & Import

**Status:** ✅ Implemented

- User can select one or more files or folders
- Folders are scanned recursively for image files
- Supported extensions: `jpg`, `jpeg`, `png`, `webp`, `bmp`, `gif`, `heic`
- Discovered images are registered in the database (`INSERT OR IGNORE` — safe to re-import)
- Image files remain in their original locations
- Data stored per image:
  - File path, file name, file size (bytes)
  - Creation and modification timestamps
- Import produces a deterministic summary: total scanned, imported, skipped, failed

---

### Image Metadata Persistence

**Status:** ✅ Implemented

- Image metadata is stored in the database
- One database record per discovered image
- Metadata persists across application restarts
- Database acts as single source of truth

---

### Cursor-Based Paginated Retrieval

**Status:** ✅ Implemented

- All gallery views use cursor-based (keyset) pagination
- Deterministic ordering guaranteed
- UI does not load the full dataset at once
- Supports large image collections efficiently
- Unreadable files are filtered at retrieval time (not stored with errors)

---

### Content Hashing (BLAKE3)

**Status:** ✅ Implemented

- SHA-256 hash computed from full file content via streaming read
- Prevents high memory usage for large files
- Hash stored persistently in database
- Hashing runs as a background worker (`FileHashWorker`)
- Hashing is the first stage of the processing pipeline (`Pending → Hashed`)
- Foundation for deterministic duplicate detection

---

### Thumbnail Generation & Caching

**Status:** ✅ Implemented

- Thumbnails generated at 256px (longest edge), saved as `.webp`
- Thumbnails generated as a background worker (`ThumbnailWorker`), after hashing completes
- Two-stage processing pipeline: `Pending → Hashed → Thumbnailed`
- Thumbnail generation does not block import or DB operations
- Each worker uses Rayon-parallel batch processing (batch size = `num_cpus * factor`)
- Workers use `MAX_WORKER_RETRIES` to skip files that fail repeatedly
- Worker execution is wrapped in `panic::catch_unwind` for crash isolation
- Thumbnails cached in the OS app cache directory
- Thumbnails associated with image records by ID

---

### Favorites

**Status:** ✅ Implemented

- Any image can be marked as a favorite via a toggle
- Favorite state persisted in the database
- Favorites gallery view: cursor-paginated listing of all favorited images
- Favorite toggle returns the new state after the operation

---

### Soft Delete (Bin)

**Status:** ✅ Implemented

- Images can be soft-deleted (moved to the Bin) without removing from disk or database
- Soft-deleted images are excluded from the main gallery
- Bin view shows all soft-deleted images (cursor-paginated)
- Undo soft delete restores an image to the main gallery
- No files are modified or deleted on disk

---

### Tagging & Organization

**Status:** ✅ Implemented

- Tags stored in a dedicated database table (`TagType`: `User` / `Deleted`)
- Many-to-many relationship between images and tags enforced at the database level
- Referential integrity enforced
- Tags persist across application restarts
- Tag management:
  - Create a new user tag (name + hex color; name is normalized to lowercase-hyphenated; color validated and uppercased)
  - Edit tag name and/or color (partial updates supported)
  - Soft-delete a tag (changes type to `Deleted`; not physically removed)
  - List all tags sorted by usage count (most used first)
  - Fetch top N most-used tags
- Tag assignment on images:
  - Toggle tag on/off for a given image
  - Duplicate tag assignments prevented at DB level
  - List tags attached to a specific image
  - List tags _not yet_ attached to a specific image (available tags)
- Tag Gallery: cursor-paginated image listing scoped to a specific tag

---

### Structured Error Handling & Logging

**Status:** ✅ Implemented

- Explicit error taxonomy at each layer:
  - `AppError`: `Scan`, `Join`, `Database`, `Internal`, `FileAccess`, `Validation`, `Unknown`
  - `DatabaseError`: wraps `sqlx::Error`, includes `RecordAlreadyExists` variant
  - `CommandError`: frontend-safe serialization of application errors
  - Processing errors: `MetadataError`, `ThumbnailError`, `HashError`

- Worker errors handled per-item with retry tracking
- Individual item failures do not abort the batch
- `panic::catch_unwind` isolation prevents any single file from crashing a worker
- Fatal errors terminate cleanly with structured diagnostics

- Logs never include raw image data

---

### Scan Metrics & Observability

**Status:** ✅ Implemented

Each import produces a deterministic summary:

- Total files visited
- Valid images indexed
- Skipped / walk errors
- Metadata extraction failures
- Total imported to database

Each worker batch logs:

- Input count, output count, DB updated count
- Batch duration (milliseconds)
- Worker name and batch ID

System state and health can be diagnosed from logs alone.

---

### Gallery Views

**Status:** ✅ Implemented

Four distinct gallery views, all cursor-paginated with readability filtering:

| View ID     | Filter                                    |
| ----------- | ----------------------------------------- |
| Gallery     | Active images (`is_deleted = false`)      |
| Favorites   | Favorited active images                   |
| Bin         | Soft-deleted images (`is_deleted = true`) |
| Tag Gallery | Active images with a specific tag         |

- Readability check applied at retrieval: unreadable files are silently skipped with a warning log
- Next-page cursor returned when more results exist

---

## Out of Scope (For Now)

- File copying or app-managed storage
- Automatic file reorganization
- Similarity or AI-based image matching
- Cloud sync or sharing features
- Automatic duplicate resolution
- Physical file deletion from disk

---

## System Design Guarantees

The system is built around the following principles:

- **Deterministic behavior** — same input always produces same output
- **Local-first operation** — no network calls, no cloud dependency
- **Explicit state transitions** — `Pending → Hashed → Thumbnailed` tracked in DB
- **No hidden or automatic file modification** — files are never moved, renamed, or deleted
- **Database as single source of truth** — all state is in SQLite
- **Observable and diagnosable operation** through structured `tracing` logs
- **Panic isolation** — background workers cannot crash the application

---

## How to Use This Document

- Anything listed under **Implemented Capabilities** must work end-to-end.
- This document reflects production-level backend guarantees.
- Capabilities are added only after full implementation and validation.
- Planned or experimental features must not appear here.
