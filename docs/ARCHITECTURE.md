# Clarity Architecture Reference (Phase 1.1)

## 1. Core Philosophy: The Clean Architecture

Clarity uses a **Clean Architecture** approach. This means the application is divided into concentric layers, with dependencies flowing **inwards**.

Source code dependencies can only point inwards. Nothing in an inner circle can know anything at all about something in an outer circle.

## 2. Directory Structure

This structure ensures separation of concerns and prepares the app for complex features like deduplication and tagging.

```text
src/
├── domain/                  # THE CORE (Pure Rust, No IO)
│   ├── mod.rs
│   ├── imagefile.rs         # ImageFile entity, ProcessStatus enum & helpers
│   ├── filemetadata.rs      # FileMetadata struct (path, name, size, timestamps)
│   └── imagemetadata.rs     # ImageMetadata struct (thumbnail path, dimensions)
│
├── application/             # THE ORCHESTRATOR (Use Cases)
│   ├── mod.rs
│   ├── dtos.rs              # Data Transfer Objects (Image, ImportSummary)
│   ├── importer.rs          # Pipeline: Scan -> Extract Metadata -> Persist
│   ├── library.rs           # Gallery browsing: paginated listing with readability filter
│   └── background.rs        # ThumbnailWorker: background thumbnail generation loop
│
├── infrastructure/          # THE TOOLS (IO, DB, FS, External Libs)
│   ├── mod.rs
│   ├── repo/                # Database interactions
│   │   ├── mod.rs
│   │   ├── image_repo.rs    # SQL for Images (paginated list, bulk insert, bulk update)
│   │   └── error.rs         # DatabaseError
│   ├── fs/                  # File System interactions
│   │   ├── mod.rs
│   │   ├── scanner.rs       # Directory walking & image extension filtering
│   │   ├── ops.rs           # ensure_dir, is_file_readable
│   │   └── error.rs         # ScanError, FileAccessError
│   └── media/               # Image Processing
│       ├── mod.rs
│       ├── metadata.rs      # Thumbnail generation, file metadata extraction & parallel processing
│       ├── hashing.rs       # SHA-256 file hashing (currently unused, reserved for dedup)
│       └── error.rs         # MetadataError, ImageMetadataError, ThumbnailError
│
├── interface/               # THE GATEWAY (Tauri)
│   ├── mod.rs
│   ├── commands.rs          # Tauri commands: save_images, fetch_scanned_images
│   └── error.rs             # DbInitError enum
│
├── setup/                   # APP BOOTSTRAP
│   ├── mod.rs               # setup_app: DB init, state management, worker spawn
│   ├── dbsetup.rs           # SQLite pool creation, migrations, PRAGMA optimization
│   ├── tracesetup.rs        # Tracing/logging initialization (tracing-subscriber)
│   └── state.rs             # AppState struct & Db type alias
│
├── error.rs                 # Top-level AppError enum & user_friendly_message()
├── lib.rs                   # Library root: Tauri builder, plugin registration, command wiring
└── main.rs                  # Application entry point
```

---

## 3. Layer Responsibilities & Decision Log

### **A. Domain Layer (`src/domain/`)**

- **Role:** Defines _what_ the application is.
- **Rules:** Pure Rust. **Zero** dependencies on `sqlx`, `tauri`, or `std::fs`.
- **Current Contents:**
  - **`imagefile.rs`:** The central `ImageFile` entity (DB-mapped via `sqlx::FromRow`) with `ProcessStatus` enum (`Pending`, `Complete`, `Error`). Contains pure helper methods: `dimensions_string()`, `size_string()`, `update_metadata()`, `mark_error()`.
  - **`filemetadata.rs`:** Lightweight `FileMetadata` struct representing raw filesystem information (path, name, size, creation/modification timestamps) before database insertion.
  - **`imagemetadata.rs`:** `ImageMetadata` struct holding post-processing data (thumbnail path, dimensions). Implements `From<ImageFile>` for easy conversion.

### **B. Application Layer (`src/application/`)**

- **Role:** Coordinates the work. It tells the Infrastructure _what_ to do.
- **Rules:** Contains business logic flows. Knows about Domain and Infrastructure interfaces.
- **Current Contents:**
  - **`dtos.rs`:** Frontend-facing Data Transfer Objects. `Image` converts domain `ImageFile` into camelCase JSON with human-readable `file_size` and `resolution` strings. `ImportSummary` reports detailed import statistics (discovered, processed, imported, skipped, errors).
  - **`importer.rs`:** The import pipeline: _Scan directories → Extract metadata in parallel → Bulk insert to DB in chunks of 50_. Uses `JoinSet` for concurrent directory scanning.
  - **`library.rs`:** Gallery browsing service. Fetches paginated images from the database and filters out unreadable files (logging warnings for skipped entries).
  - **`background.rs`:** `ThumbnailWorker` — a long-running background task spawned at startup. Polls for `Pending` images, generates thumbnails in parallel (batch size = `num_cpus * 2`), and bulk-updates metadata back to the database.

### **C. Infrastructure Layer (`src/infrastructure/`)**

- **Role:** The implementation details. Handles dirty work like Disk IO and SQL.
- **Rules:** The only layer allowed to touch the database, file system, or external image libraries.
- **Current Contents:**
  - **`repo/image_repo.rs`:** SQL operations for the `image_file` table — paginated listing, bulk insert (using `INSERT OR IGNORE` for dedup by path), fetching pending process images, and transactional bulk metadata updates.
  - **`repo/error.rs`:** `DatabaseError` enum wrapping `sqlx::Error`.
  - **`fs/scanner.rs`:** Directory walking via `walkdir`. Filters by supported image extensions (jpg, jpeg, png, webp, bmp, gif, heic). Returns `ScanResult` with image paths, total file count, and walk error count.
  - **`fs/ops.rs`:** File system utilities — `ensure_dir` (recursive mkdir) and `is_file_readable` (open-based readability check with typed errors).
  - **`fs/error.rs`:** `ScanError` and `FileAccessError` enums.
  - **`media/metadata.rs`:** Heavy lifting module combining thumbnail generation (via `image-rs`, 256px, saved as `.webp`), file metadata extraction (size, timestamps), and parallel metadata extraction using `futures::stream` with bounded concurrency.
  - **`media/hashing.rs`:** SHA-256 file hashing via `sha2`. Currently unused (`#[allow(dead_code)]`), reserved for future deduplication feature.
  - **`media/error.rs`:** `MetadataError`, `ImageMetadataError`, and `ThumbnailError` enums with detailed error context.

### **D. Interface Layer (`src/interface/`)**

- **Role:** The "Front Desk". Receives requests from Tauri/JS and hands them to the Application layer.
- **Rules:** Thin wrappers only. No business logic allowed.
- **Current Contents:**
  - **`commands.rs`:** Two Tauri commands — `save_images` (triggers the import pipeline) and `fetch_scanned_images` (paginated gallery loading). Both include tracing spans and convert `AppError` to user-friendly strings.
  - **`error.rs`:** `DbInitError` enum covering database initialization failures (missing app data dir, connection errors, migration errors, optimization errors).

### **E. Setup Module (`src/setup/`)**

- **Role:** Application bootstrap and dependency wiring. Runs once at startup.
- **Current Contents:**
  - **`mod.rs`:** `setup_app` function — called by Tauri's `.setup()` hook. Initializes the database, registers `AppState`, and spawns the `ThumbnailWorker`.
  - **`dbsetup.rs`:** Creates the SQLite connection pool with production-tuned PRAGMAs (WAL mode, 40MB cache, memory-mapped IO). Runs migrations and optimizes.
  - **`tracesetup.rs`:** Initializes `tracing-subscriber` with `EnvFilter` support (defaults to `info` level).
  - **`state.rs`:** Defines `Db` type alias (`Pool<Sqlite>`) and `AppState` struct.

### **F. Error Handling (`src/error.rs`)**

- **Role:** Centralized application-level error type.
- **Current Contents:** `AppError` enum unifying errors from Scan, Join, Database, Internal, and FileAccess. `user_friendly_message()` maps internal errors to safe, user-facing strings for the frontend.

---

## 4. Data Flow

### Import Pipeline

```
Frontend (save_images)
  → interface/commands.rs
    → application/importer.rs
      → infrastructure/fs/scanner.rs      (walk directories)
      → infrastructure/media/metadata.rs  (extract file metadata in parallel)
      → infrastructure/repo/image_repo.rs (bulk insert in chunks of 50)
    ← ImportSummary DTO
  ← JSON response
```

### Thumbnail Generation (Background)

```
application/background.rs (ThumbnailWorker loop)
  → infrastructure/repo/image_repo.rs     (fetch pending images)
  → infrastructure/media/metadata.rs      (generate thumbnails via image-rs)
  → infrastructure/repo/image_repo.rs     (bulk update metadata in transaction)
```

### Gallery Loading

```
Frontend (fetch_scanned_images)
  → interface/commands.rs
    → application/library.rs
      → infrastructure/repo/image_repo.rs (paginated query)
      → infrastructure/fs/ops.rs          (readability filter)
    ← Vec<Image> DTO
  ← JSON response
```

---

## 5. Feature Implementation Status

| Feature          | Status | Location                                                         | Notes                                                                                           |
| ---------------- | ------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Image Import     | ✅     | `application/importer.rs`                                        | Parallel scan, metadata extraction, chunked DB insert                                           |
| Image Gallery    | ✅     | `application/library.rs`                                         | Paginated listing with readability filter                                                       |
| Thumbnails       | ✅     | `application/background.rs` + `infrastructure/media/metadata.rs` | Background worker generates 256px WebP thumbnails                                               |
| File Hashing     | 🔲     | `infrastructure/media/hashing.rs`                                | SHA-256 implemented but unused. Reserved for deduplication                                      |
| Duplicate Detect | 🔲     | —                                                                | Planned. Will use `hashing.rs` + new `domain/rules.rs` for comparison logic                     |
| In-Place Delete  | 🔲     | —                                                                | Planned for `infrastructure/fs/ops.rs`                                                          |
| Tagging          | 🔲     | —                                                                | Planned. Will need `domain/tag.rs`, `application/tagging.rs`, `infrastructure/repo/tag_repo.rs` |
| Traversal        | 🔲     | —                                                                | Planned for `application/library.rs`. Next/Prev navigation based on sort order                  |

**Legend:** ✅ Implemented | 🔲 Planned | ⚠️ Legacy (needs migration)

---

## 6. Testing Strategy

The architecture supports the **Testing Pyramid**, prioritizing fast unit tests over slow end-to-end tests.

- **Unit Tests (`domain/`, `application/`):** Test logic (e.g., "Does `1024 bytes` format to `1 KB`?"). Fast, no IO.
- **Integration Tests (`tests/`):** Test the flow (e.g., "Does `import_directory` call `save_image`?"). Use mocks for FS/DB.
- **Infrastructure Tests (`infrastructure/`):** Test the metal (e.g., "Does this SQL query actually insert a row?"). Slow, requires setup.
- **End-to-End Tests (`e2e/`):** Test the whole app (e.g., "Does the Gallery load 50 images?").
