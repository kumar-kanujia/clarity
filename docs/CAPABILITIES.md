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

## Not Yet Implemented (Planned)

### Photo Viewing

**Status:** ⏳ Planned

- Display images from original file paths
- Navigate images reliably
- Handle missing or unreadable files explicitly

---

### Duplicate Detection

**Status:** ⏳ Planned

- Identify duplicate images
- Make duplicate behavior explicit and predictable
- Avoid ambiguous or silent handling

---

### Tagging & Organization

**Status:** ⏳ Planned

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

---
