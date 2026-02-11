# CAPABILITIES.md

## Implemented Capabilities

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
- Deterministic ordering
- UI does not load the full dataset at once
- Supports large image collections

---

### Thumbnail Generation & Caching

**Status:** ✅ Implemented (Testing-Level UI)

- Single deterministic thumbnail size
- Thumbnails generated on demand
- Thumbnail extraction does not block scanning or DB operations
- Thumbnails associated with image IDs
- Thumbnails cached locally
- Extraction failures handled safely without retries

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

## Not Yet Implemented (Planned)

### Duplicate Detection

- Identify duplicate images deterministically
- Make duplicate behavior explicit and predictable
- Avoid ambiguous or silent handling

### Tagging & Organization

- Allow users to tag images
- Persist tags in the database
- Enable basic organization workflows

---

## Out of Scope (For Now)

- File copying or app-managed storage
- Automatic file reorganization
- Similarity or AI-based image matching
- Cloud sync or sharing features

---

## How to Use This Document

- Anything listed under **Implemented Capabilities** must work end-to-end.
- Planned capabilities are intentionally high-level and may change.
- This document should be updated only when a capability becomes real.
