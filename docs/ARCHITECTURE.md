# Clarity Architecture Reference (Phase 1.2)

## 1. Core Philosophy: The Clean Architecture

Clarity uses a **Clean Architecture** approach. This means the application is divided into concentric layers, with dependencies flowing **inwards**.

Source code dependencies can only point inwards. Nothing in an inner circle can know anything at all about something in an outer circle.

## 2. Directory Structure

This structure ensures separation of concerns and prepares the app for complex features like deduplication and tagging.

```text
src/
├── domain/                  # THE CORE (Pure Rust, No IO)
│   ├── mod.rs
│   ├── file.rs              # FileMetaData struct & FileScanSummary
│   ├── image.rs             # Image entity, ImageMetadata, ImageStatus, helper methods
│   └── tag.rs               # Tag entity with normalize_text() & normalize_color()
│
├── application/             # THE ORCHESTRATOR (Use Cases)
│   ├── mod.rs
│   ├── error.rs             # AppError enum (centralized application-level errors)
│   ├── service/             # Stateless services (business logic units)
│   │   ├── mod.rs
│   │   ├── file_scan_service.rs     # Scan paths for images & extract file metadata (Rayon)
│   │   ├── file_hash_service.rs     # BLAKE3 hashing batch processor (Rayon + panic guard)
│   │   ├── image_mutation_service.rs # Persist images, toggle favorite, set deleted status
│   │   ├── image_query_service.rs   # Paginated gallery, bin, favorites & tag-filtered listing
│   │   ├── image_tag_service.rs     # Toggle tag on image, list attached/available tags
│   │   ├── tag_service.rs           # Create, edit, soft-delete & list user tags
│   │   └── thumbnail_service.rs     # Thumbnail generation (image-rs, 256px WebP) + panic guard
│   ├── worker/              # Long-running background tasks implementing the Worker trait
│   │   ├── mod.rs           # Worker trait: fetch_batch → process_batch → update_batch loop
│   │   ├── file_hash_worker.rs      # Hashes Pending images (batch_factor=4), → Hashed status
│   │   └── thumbnail_worker.rs     # Generates thumbnails for Hashed images, → Thumbnailed status
│   └── workflow/            # Multi-step orchestration flows
│       ├── mod.rs
│       └── image_import_workflow.rs # Scan paths → extract metadata → bulk insert pipeline
│
├── infrastructure/          # THE TOOLS (IO, DB, FS, External Libs)
│   ├── mod.rs
│   ├── utils.rs             # format_datetime helper
│   ├── models/              # SQLx row models (DB schema representations)
│   │   ├── mod.rs
│   │   ├── image_model.rs   # ImageRow, ImageItemRow, ImageStatus enum (Pending/Hashed/Thumbnailed)
│   │   ├── tag_model.rs     # TagRow, TagType enum (User/Deleted)
│   │   └── image_tag_model.rs # ImageTagRow join model
│   ├── repo/                # Database interactions
│   │   ├── mod.rs
│   │   ├── error.rs         # DatabaseError enum
│   │   ├── image_repo.rs    # SQL for images: paginated listing (gallery/bin/favorites/tag),
│   │   │                    #   bulk insert, fetch for processing, update hash, update metadata
│   │   ├── tag_repo.rs      # SQL for tags: create, update, soft-delete, list by popularity
│   │   └── image_tag_repo.rs # SQL for image↔tag junction: toggle, get attached/available
│   ├── fs/                  # File System interactions
│   │   ├── mod.rs
│   │   ├── fs_scanner.rs    # Directory walking & image extension filtering → FileScanSummary
│   │   ├── ops.rs           # ensure_dir, is_file_readable
│   │   └── error.rs         # ScanError, FileAccessError
│   ├── processing/          # CPU-bound media & hashing operations
│   │   ├── mod.rs
│   │   ├── metadata.rs      # File metadata extraction (size, timestamps) using std::fs
│   │   ├── thumbnail.rs     # Thumbnail generation (image-rs, 256px WebP, saves to cache dir)
│   │   ├── hashing.rs       # SHA-256 streaming file hashing via sha2
│   │   └── error.rs         # ProcessingError types
│   └── system/              # System-level abstractions (reserved)
│       └── mod.rs
│
├── interface/               # THE GATEWAY (Tauri IPC layer)
│   ├── mod.rs
│   ├── error.rs             # CommandError: wraps AppError, DbInitError for Tauri serialization
│   ├── command/             # Tauri #[command] handlers (thin wrappers, no business logic)
│   │   ├── mod.rs
│   │   ├── gallery_command.rs   # fetch_gallery, fetch_bin, fetch_favorites, fetch_tag_gallery
│   │   ├── image_command.rs     # import_images, toggle_favorite, soft_delete_image,
│   │   │                        #   undo_soft_delete_image
│   │   ├── image_tag_command.rs # toggle_tag, fetch_attached_tags, fetch_available_tags
│   │   └── tag_command.rs       # create_tag, edit_tag, fetch_top_tags, fetch_all_tags,
│   │                            #   soft_delete_tag
│   └── dtos/                # Frontend-facing Data Transfer Objects
│       ├── mod.rs
│       ├── image_dto.rs     # ImageItem, ImageItemResult, CreatedAtCursor, ImportSummary
│       └── tag_dto.rs       # TagItem DTO
│
├── setup/                   # APP BOOTSTRAP
│   ├── mod.rs               # app_setup (Tauri .setup() hook), app_callback
│   ├── dbsetup.rs           # SQLite pool creation, WAL mode, 40MB cache, migrations
│   ├── logger.rs            # Logger::init() — tracing-subscriber with EnvFilter
│   ├── settings.rs          # FETCH_LIMIT, MAX_WORKER_RETRIES constants
│   ├── state.rs             # AppState struct & Db type alias (Pool<Sqlite>)
│   └── error.rs             # DbInitError enum
│
├── lib.rs                   # Library root: Tauri builder, plugin registration, command wiring
└── main.rs                  # Application entry point
```

---

## 3. Layer Responsibilities & Decision Log

### **A. Domain Layer (`src/domain/`)**

- **Role:** Defines _what_ the application is.
- **Rules:** Pure Rust. **Zero** dependencies on `sqlx`, `tauri`, or `std::fs`.
- **Current Contents:**
  - **`image.rs`:** The central `Image` entity with fields for `id`, `file_name`, `path`, `size_bytes`, `content_hash`, `width`, `height`, `thumbnail_path`, `status` (`ImageStatus` enum: `Pending → Hashed → Thumbnailed`), `retry_count`, `error_message`, `is_favorite`, `is_deleted`. Contains `ImageMetadata` struct and helper methods: `update_hash()`, `mark_hash_error()`, `update_image_metadata()`, `mark_image_metadata_error()`, `group_by_hash()`, `make_resolution_string()`, `make_size_string()`. Owns the canonical list of supported extensions via `get_extensions()`.
  - **`file.rs`:** `FileMetaData` struct (path, name, size, timestamps) and `FileScanSummary` (discovered files list + walk_error count) for the import pipeline.
  - **`tag.rs`:** `Tag` entity with normalization helpers `normalize_text()` (lowercase, hyphenated) and `normalize_color()` (hex validation, 3→6 char expansion, uppercase output).

### **B. Application Layer (`src/application/`)**

- **Role:** Coordinates the work. Orchestrates Infrastructure via services and workers.
- **Rules:** Contains business logic flows. Zero Tauri or SQLx imports at this layer.
- **Current Contents:**

  **Services (`application/service/`)** — stateless, async, injected with repository instances:
  - **`file_scan_service.rs`:** Scans a list of paths (files or directories) using `walkdir` via `fs_scanner`. Extracts file metadata in parallel with Rayon. Both phases run inside `spawn_blocking` to avoid blocking the async runtime.
  - **`file_hash_service.rs`:** Processes a batch of `Image` items in parallel (Rayon). Generates SHA-256 hash via `hashing::generate_file_hash`. Wraps execution in `panic::catch_unwind` for safety.
  - **`image_mutation_service.rs`:** `persist_file_metadata_for_images` (bulk insert), `change_image_is_favorite` (toggle), `change_image_is_deleted` (soft delete / undo).
  - **`image_query_service.rs`:** `list_image_items` — cursor-paginated gallery/favorites/bin browsing with `is_deleted` and `is_favorite` filters + readability check. `list_tagged_image_items` — cursor-paginated listing scoped to a tag.
  - **`image_tag_service.rs`:** `toggle_tag_on_image`, `list_attached_tags_on_image`, `list_available_tags_on_image`.
  - **`tag_service.rs`:** `create_new_user_tag` (name/color normalization + uniqueness guard), `edit_user_tag` (partial update), `soft_delete_user_tag`, `list_user_tags` (popularity-sorted).
  - **`thumbnail_service.rs`:** `process_batch` — generates 256px WebP thumbnails in parallel (Rayon), wraps each call in `panic::catch_unwind`. `get_thumbnail_target` resolves the correct cache dir for debug vs. release builds.

  **Workers (`application/worker/`)** — long-running background loops:
  - **`mod.rs`:** Defines the `Worker` trait: `fetch_batch → process_batch (blocking) → update_batch`. The generic `run()` method drives the loop, sleeps 5 s on empty queue, holds 30 s on error, and supports clean shutdown via `CancellationToken`.
  - **`file_hash_worker.rs`:** Fetches `Pending` images → SHA-256 hashes them (batch_factor=4) → bulk-updates `content_hash` and marks them `Hashed`.
  - **`thumbnail_worker.rs`:** Fetches `Hashed` images → generates thumbnails (batch_factor=2) → bulk-updates `thumbnail_path`, `width`, `height`, marks them `Thumbnailed`.

  **Workflows (`application/workflow/`)** — multi-step orchestration:
  - **`image_import_workflow.rs`:** `scan_and_import_images` — orchestrates `file_scan_service` (scan + metadata extraction) then `ImageMutationService::persist_file_metadata_for_images`. Returns an `ImportSummary` with `total_scanned`, `skipped`, `imported`, `failed` counts.

### **C. Infrastructure Layer (`src/infrastructure/`)**

- **Role:** The implementation details. Handles dirty work like Disk IO and SQL.
- **Rules:** The only layer allowed to touch the database, file system, or external image libraries.
- **Current Contents:**

  **Models (`infrastructure/models/`)** — SQLx `FromRow` structs mapping DB columns:
  - **`image_model.rs`:** `ImageRow` (full image record) and `ImageItemRow` (display subset). `ImageStatus` enum: `Pending`, `Hashed`, `Thumbnailed`.
  - **`tag_model.rs`:** `TagRow` with `TagType` enum: `User`, `Deleted` (soft-delete flag in DB).
  - **`image_tag_model.rs`:** `ImageTagRow` join model for the many-to-many relationship.

  **Repositories (`infrastructure/repo/`)** — async SQL wrappers:
  - **`image_repo.rs`:** Paginated listing (gallery / favorites / bin / by-tag), bulk insert (`INSERT OR IGNORE`), `get_images_for_processing` (by status + retry limit), `toggle_image_favorite`, `set_image_deleted_status`, `update_images_content_hash`, `update_image_metadata`.
  - **`tag_repo.rs`:** `create_new_tag`, `update_tag` (name/color), `update_tag_type` (soft-delete by type change), `get_popular_tags` (ordered by usage count).
  - **`image_tag_repo.rs`:** `toggle_image_tag` (insert-or-delete junction row), `get_tags_attached_to_image`, `get_tags_not_attached_to_image`.

  **File System (`infrastructure/fs/`):**
  - **`fs_scanner.rs`:** `scan_path_for_images` — directory walking via `walkdir`, filters by `Image::get_extensions()`. Returns `FileScanSummary`.
  - **`ops.rs`:** `ensure_dir` (recursive mkdir), `is_file_readable` (open-based check).

  **Processing (`infrastructure/processing/`)** — CPU-bound operations:
  - **`metadata.rs`:** `get_file_metadata` — extracts name, size, creation/modification timestamps from filesystem.
  - **`thumbnail.rs`:** `create_image_metadata` — decodes image with `image-rs`, resizes to 256px (fit), saves as `.webp` to a deterministic path in the cache directory.
  - **`hashing.rs`:** `generate_file_hash` — SHA-256 streaming hash via `sha2`. Fully active, used by `FileHashWorker`.

### **D. Interface Layer (`src/interface/`)**

- **Role:** The "Front Desk". Receives requests from Tauri/JS and hands them to the Application layer.
- **Rules:** Thin wrappers only. No business logic allowed.
- **Current Contents:**

  **Commands (`interface/command/`):**
  - **`gallery_command.rs`:** `fetch_gallery` (active images), `fetch_bin` (soft-deleted), `fetch_favorites`, `fetch_tag_gallery` (by tag ID). All use cursor-based pagination.
  - **`image_command.rs`:** `import_images`, `toggle_favorite`, `soft_delete_image`, `undo_soft_delete_image`.
  - **`image_tag_command.rs`:** `toggle_tag`, `fetch_attached_tags`, `fetch_available_tags`.
  - **`tag_command.rs`:** `create_tag`, `edit_tag`, `fetch_top_tags`, `fetch_all_tags`, `soft_delete_tag`.

  **DTOs (`interface/dtos/`):**
  - **`image_dto.rs`:** `ImageItem` (camelCase JSON with human-readable size + resolution strings), `ImageItemResult` (paginated result + next cursor), `CreatedAtCursor`, `ImportSummary`.
  - **`tag_dto.rs`:** `TagItem` DTO for tag data serialized to the frontend.

### **E. Setup Module (`src/setup/`)**

- **Role:** Application bootstrap and dependency wiring. Runs once at startup.
- **Current Contents:**
  - **`mod.rs`:** `app_setup` (Tauri `.setup()` hook) — initializes DB, registers `AppState`, spawns `FileHashWorker` and `ThumbnailWorker` with `CancellationToken`-based shutdown. `app_callback` handles the `RunEvent::Exit` shutdown signal.
  - **`dbsetup.rs`:** Creates the SQLite connection pool with production-tuned PRAGMAs (WAL mode, 40MB cache, memory-mapped IO). Runs migrations and optimizes.
  - **`logger.rs`:** `Logger::init()` — initializes `tracing-subscriber` with `EnvFilter` (defaults to `info` level).
  - **`settings.rs`:** Constants — `FETCH_LIMIT` (gallery page size), `MAX_WORKER_RETRIES` (max retry count before a worker skips a record).
  - **`state.rs`:** `Db` type alias (`Pool<Sqlite>`) and `AppState` struct.
  - **`error.rs`:** `DbInitError` enum covering database initialization failures.

---

## 4. Data Flow

### Import Pipeline

```
Frontend (import_images)
  → interface/command/image_command.rs
    → application/workflow/image_import_workflow.rs
      → application/service/file_scan_service.rs    (walk paths, extract file metadata)
      → application/service/image_mutation_service.rs
        → infrastructure/repo/image_repo.rs         (bulk INSERT OR IGNORE)
    ← ImportSummary DTO
  ← JSON response
```

### Background Processing Pipeline (Image Status Machine)

```
[Pending] ──────────────────────────────────── FileHashWorker
  application/worker/file_hash_worker.rs
    → infrastructure/repo/image_repo.rs         (fetch Pending images)
    → application/service/file_hash_service.rs  (BLAKE3 hash, Rayon parallel)
    → infrastructure/repo/image_repo.rs         (bulk update content_hash → Hashed)

[Hashed] ─────────────────────────────────── ThumbnailWorker
  application/worker/thumbnail_worker.rs
    → infrastructure/repo/image_repo.rs         (fetch Hashed images)
    → application/service/thumbnail_service.rs  (generate 256px WebP, Rayon parallel)
    → infrastructure/repo/image_repo.rs         (bulk update thumbnail metadata → Thumbnailed)
```

### Gallery Loading

```
Frontend (fetch_gallery | fetch_favorites | fetch_bin | fetch_tag_gallery)
  → interface/command/gallery_command.rs
    → application/service/image_query_service.rs
      → infrastructure/repo/image_repo.rs       (cursor-paginated query with filters)
      → infrastructure/fs/ops.rs                (is_file_readable filter)
    ← ImageItemResult DTO (Vec<ImageItem> + next_cursor)
  ← JSON response
```

### Tagging Flow

```
Frontend (toggle_tag / create_tag / etc.)
  → interface/command/image_tag_command.rs | tag_command.rs
    → application/service/image_tag_service.rs | tag_service.rs
      → infrastructure/repo/image_tag_repo.rs | tag_repo.rs (SQL)
    ← bool / TagItem / ()
  ← JSON response
```

---

## 5. Image Status State Machine

```
[Import] → Pending → [FileHashWorker] → Hashed → [ThumbnailWorker] → Thumbnailed
                 ↑ retry (on error)           ↑ retry (on error)
```

- Workers respect `MAX_WORKER_RETRIES` — images exceeding the retry limit are skipped.
- Each state transition is persisted atomically to the database.

---

## 6. Feature Implementation Status

| Feature               | Status | Location                                                                            | Notes                                                                                 |
| --------------------- | ------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Image Import          | ✅     | `application/workflow/image_import_workflow.rs`                                     | Parallel scan + metadata extraction, chunked DB insert                                |
| File Hashing (BLAKE3) | ✅     | `application/worker/file_hash_worker.rs` + `infrastructure/processing/hashing.rs`   | Fully active background worker. Enables deduplication.                                |
| Thumbnail Generation  | ✅     | `application/worker/thumbnail_worker.rs` + `infrastructure/processing/thumbnail.rs` | Background worker generates 256px WebP thumbnails after hashing                       |
| Gallery / Bin / Favs  | ✅     | `application/service/image_query_service.rs`                                        | Cursor-paginated listing; filtered by is_deleted / is_favorite                        |
| Favorites             | ✅     | `application/service/image_mutation_service.rs`                                     | Toggle favorite on any image                                                          |
| Soft Delete (Bin)     | ✅     | `application/service/image_mutation_service.rs`                                     | Soft delete + undo; deleted images moved to Bin view                                  |
| Tagging (Backend)     | ✅     | `application/service/tag_service.rs` + `image_tag_service.rs`                       | Create/edit/soft-delete tags; toggle tag on image; list attached/available            |
| Tag Gallery           | ✅     | `application/service/image_query_service.rs`                                        | Cursor-paginated gallery scoped to a specific tag                                     |
| Duplicate Detection   | 🔲     | —                                                                                   | Image hashes stored. Needs `group_by_hash()` surfaced and a UI/command for dedup view |
| In-Place File Delete  | 🔲     | —                                                                                   | Planned for `infrastructure/fs/ops.rs`                                                |

**Legend:** ✅ Implemented | 🔲 Planned

---

## 7. Testing Strategy

The architecture supports the **Testing Pyramid**, prioritizing fast unit tests over slow end-to-end tests.

- **Unit Tests (`domain/`, `application/service/`):** Test pure logic (e.g., `Tag::normalize_color()`, `Image::make_size_string()`). Fast, no IO.
- **Integration Tests (`tests/`):** Test flows (e.g., "Does `scan_and_import_images` call the repo?"). Use mocks or in-memory SQLite.
- **Infrastructure Tests (`infrastructure/`):** Test the metal (e.g., "Does the SQL query insert a row?"). Slow, requires setup.
- **End-to-End Tests (`e2e/`):** Test the whole app (e.g., "Does the Gallery load 50 images?").
