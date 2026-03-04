# CAPABILITIES.md

## Implemented Capabilities

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

- BLAKE3 hash computed from full file content via streaming read
- Prevents high memory usage for large files
- Hash stored persistently in database
- Hashing is performed by a dedicated background worker
- Hash establishes deterministic file identity
- Provides foundation for exact duplicate detection

---

### Event-Driven Worker System

**Status:** ✅ Implemented

The processing pipeline is fully event-driven.

- Workers execute only when work exists
- Workers remain idle when no work is available
- Workers activate immediately when events are emitted
- No continuous polling or loop-based processing exists

Event guarantees:

- Events emitted only after successful database commit
- Duplicate events cannot cause duplicate processing
- Worker execution is deterministic
- Worker crash isolation enforced via panic containment
- Retry logic ensures transient failures do not block processing
- Worker restart safely resumes unfinished work

Pipeline stages:

`Pending → Hashed → Thumbnailed`

Each stage emits events that trigger the next stage.

---

### Thumbnail Generation & Caching

**Status:** ✅ Implemented

- Thumbnails generated at 256px (longest edge), saved as `.webp`
- Thumbnail generation triggered automatically after hashing completes
- Thumbnail generation performed by background workers
- Thumbnail generation does not block import or database operations
- Thumbnails cached in the OS app cache directory
- Thumbnails associated with image records by ID
- Thumbnail cache lifecycle tied to image lifecycle

Reliability guarantees:

- Worker crash isolation via panic containment
- Retry limits enforced for problematic files
- Batch processing performed safely

---

### Favorites

**Status:** ✅ Implemented

- Any image can be marked as a favorite via a toggle
- Favorite state persisted in the database
- Favorites gallery view supported
- Favorite toggle returns new state after operation

---

### Tagging & Organization

**Status:** ✅ Implemented

Tag system supports full lifecycle management.

Tag creation:

- Create user-defined tag (name + hex color)
- Name normalization enforced
- Color validation enforced

Tag assignment:

- Assign tag to image
- Remove tag from image
- Prevent duplicate assignments
- List tags on image
- List tags not yet assigned

Tag lifecycle:

- Soft delete tag (reversible)
- Restore deleted tag
- Permanent tag delete

Integrity guarantees:

- Tag ID preserved across restore
- Tag assignments preserved across restore
- Permanent delete removes all tag relationships
- Referential integrity enforced at database level

Tag querying:

- List all active tags
- List deleted tags
- List all tags
- List tags sorted by usage count
- Retrieve most-used tags

Tag gallery:

- Cursor-paginated image listing by tag

---

### Soft Delete (Bin)

**Status:** ✅ Implemented

- Images can be soft-deleted without affecting original files
- Soft-deleted images excluded from main gallery
- Bin view shows soft-deleted images
- Undo operation restores image
- No filesystem modifications occur

---

### Permanent Image Delete

**Status:** ✅ Implemented

Permanent delete fully removes image from application state.

Permanent delete removes:

- Image database record
- Tag assignments
- Favorite state
- Processing pipeline state
- Duplicate relationships
- Thumbnail cache file

Safety guarantees:

- Original image file on disk is never modified or deleted
- Operation requires explicit invocation
- Operation is fully logged
- No orphan records or files remain

---

### Bulk Operations

**Status:** ✅ Implemented

Provides deterministic bulk state transition primitives executed within a single database transaction.

Supported bulk operations:

- **Bulk Soft Delete:** Marks multiple specified images as soft-deleted without modifying original files.
- **Bulk Restore:** Restores multiple soft-deleted images.
- **Bulk Permanent Delete:** Fully removes multiple image records, tag assignments, favorite states, pipeline states, duplicate relationships, and safely cleans up thumbnail cache files.
- **Bulk Tag Attach:** Assigns a tag to multiple images, preventing duplicate assignments.
- **Bulk Tag Removal:** Removes a tag from multiple specified images.

Integrity guarantees:

- Operations never internally call single-item operations.
- No partial state transitions are possible.
- Referential integrity is strictly preserved.
- Thumbnail cache cleanup occurs only after a successful database delete.
- Structured logs are emitted for all bulk operations.

---

### Multi-Selection UI

**Status:** ✅ Implemented

Integrates deterministic multi-selection with backend bulk operations.

- Maintains selection state independently without implementing state transition logic.
- Supported selection models:
  - Single selection
  - Multi-selection
  - Selection clearing
- Directly invokes backend bulk actions for tag attach, tag removal, soft delete, restore, and permanent delete.

---

### Structured Error Handling & Logging

**Status:** ✅ Implemented

Explicit error taxonomy:

- AppError
- DatabaseError
- CommandError
- MetadataError
- ThumbnailError
- HashError

Reliability guarantees:

- Worker errors handled per-item
- Retry tracking prevents infinite retries
- Worker crashes isolated
- Fatal errors terminate cleanly

Logging guarantees:

- Structured tracing logs
- No raw image data logged
- Full operational observability

---

### Scan Metrics & Observability

**Status:** ✅ Implemented

Each import produces deterministic metrics:

- Total files visited
- Valid images indexed
- Skipped files
- Metadata failures
- Successfully imported images

Worker batches log:

- Batch input/output counts
- Database update counts
- Batch duration
- Worker identity

System state diagnosable from logs alone.

---

### Gallery Views

**Status:** ✅ Implemented

Four distinct gallery views:

| View        | Description             |
| ----------- | ----------------------- |
| Gallery     | Active images           |
| Favorites   | Favorited active images |
| Trash       | Soft-deleted images     |
| Tag Gallery | Images filtered by tag  |

Properties:

- Cursor-paginated
- Deterministic ordering
- Readability filtering applied
- Next-page cursor provided when applicable

---

## System Design Guarantees

Clarity enforces the following guarantees:

- Deterministic behavior
- Local-first operation
- Explicit state transitions
- Event-driven processing
- Database as single source of truth
- No hidden or implicit state mutation
- No modification of original files
- Full lifecycle integrity
- Crash-safe background processing
- Observable and diagnosable operation

---

## Out of Scope

The following are intentionally not implemented:

- File copying or relocation
- Automatic file organization
- Cloud synchronization
- AI-based image classification
- Automatic duplicate resolution
- Physical deletion of original image files

---

## Capability Promotion Rule

Capabilities are added to this document only when:

- Fully implemented
- Fully tested
- Deterministic
- Reliable
- Production-safe

This document defines the production guarantees of the Clarity backend.
