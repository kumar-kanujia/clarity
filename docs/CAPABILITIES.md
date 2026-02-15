# CAPABILITIES.md

## Implemented Capabilities

---

### Image Discovery & Import

**Status:** ✅ Implemented

- User can select one or more files or folders
- Folders are scanned recursively for image files
- Discovered images are registered in the database
- Image files remain in their original locations
- Supported image data stored:
  - File path
  - Image resolution
  - File size

---

### Image Metadata Persistence

**Status:** ✅ Implemented

- Image metadata is stored in the database
- One database record per discovered image
- Metadata persists across application restarts
- Database acts as the source of truth

---

### Batch-Based Retrieval

**Status:** ✅ Implemented

- Image records can be retrieved in batches
- Deterministic ordering guaranteed
- UI does not load the full dataset at once
- Supports large image collections efficiently

---

### Thumbnail Generation & Caching

**Status:** ✅ Implemented

- Single deterministic thumbnail size
- Thumbnails generated on demand
- Thumbnail extraction does not block scanning or DB operations
- Thumbnails associated with image IDs
- Thumbnails cached locally
- Extraction failures handled safely and logged

---

### Deterministic Duplicate Detection

**Status:** ✅ Implemented

- SHA-256 hash computed from file content
- Hash computed using streaming to avoid high memory usage
- Hash stored persistently in database
- Duplicate images identified by identical hash values
- No probabilistic or similarity-based detection
- No automatic merging or implicit modification
- Duplicate queries available at repository and service layer
- Duplicate counts observable during scans

---

### Tagging & Organization (Backend)

**Status:** ✅ Implemented

- Tags stored in dedicated database table
- Many-to-many relationship between images and tags
- Referential integrity enforced
- Tags persist across application restarts
- Tag assignment and removal supported
- Duplicate tag assignments prevented
- Images retrievable by tag
- Batch retrieval compatible with tag filtering
- Deterministic ordering preserved

---

### Structured Error Handling & Logging

**Status:** ✅ Implemented

- Explicit error taxonomy:
  - SCAN_ERROR
  - JOIN_ERROR
  - THUMBNAIL_ERROR
  - DATABASE_ERROR

- All errors include structured context:
  - Image ID (when available)
  - File path
  - Operation stage
  - Exception type
  - Timestamp

- Recoverable and fatal errors clearly distinguished

- Recoverable errors do not abort scans

- Fatal errors terminate cleanly with clear diagnostics

- Logs never include raw image data

---

### Scan Metrics & Observability

**Status:** ✅ Implemented

Each scan produces deterministic summary metrics:

- Total files visited
- Valid images indexed
- Skipped files (categorized)
- Metadata failures
- Database failures
- Duplicate counts
- Total scan duration

System state and health can be diagnosed from logs alone.

---

### Basic Gallery & Navigation (Testing Harness)

**Status:** ⚠️ Temporary / Testing Surface

- Grid-based thumbnail display
- Lazy loading aligned with batch retrieval
- Open image from gallery
- Next / previous navigation using deterministic ordering
- Missing-file states surfaced explicitly

Note: Current UI exists primarily as a testing harness for backend validation and is expected to be redesigned.

---

## Out of Scope (For Now)

- File copying or app-managed storage
- Automatic file reorganization
- Similarity or AI-based image matching
- Cloud sync or sharing features
- Automatic duplicate resolution

---

## System Design Guarantees

The system is built around the following principles:

- Deterministic behavior
- Local-first operation
- Explicit state transitions
- No hidden or automatic file modification
- Database as single source of truth
- Observable and diagnosable operation through structured logs

---

## How to Use This Document

- Anything listed under **Implemented Capabilities** must work end-to-end.
- This document reflects production-level backend guarantees.
- Capabilities are added only after full implementation and validation.
- Planned or experimental features must not appear here.
