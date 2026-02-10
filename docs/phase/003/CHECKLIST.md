# CHECKLIST.md

## Phase 3 — Image Indexing & Metadata

> Rule: Work **top to bottom**.
> If an item above is not done, do not start items below it.

---

## Milestone 3.1 — File Import (Reference-Based)

### File Import

- [x] Allow user to select one or more image files
- [x] Register selected files in the database
- [x] Do not copy, move, or mutate user files
- [x] Validate files are readable at import time
- [x] Reject unsupported image formats explicitly

---

### Image Identity

- [x] Assign a stable internal image ID
- [x] Ensure DB records use internal ID as primary reference
- [x] Ensure identity survives restarts
- [x] Allow DB entries to exist even if file becomes unavailable later

---

## Milestone 3.2 — Metadata Extraction

### Metadata Collection

- [x] Extract basic image metadata on import
- [x] Store image dimensions
- [x] Store file size
- [x] Store image format
- [x] Capture filesystem timestamps (best-effort)

---

### Metadata Robustness

- [ ] Metadata extraction failures do not block import
- [ ] Allow metadata to be re-extracted
- [ ] Missing metadata is handled explicitly

---

## Milestone 3.3 — Database Persistence

### Database as Source of Truth

- [ ] Persist image records and metadata reliably
- [x] Ensure one DB row per image ID
- [x] Ensure updates do not touch filesystem
- [x] Verify DB state survives restarts

---

### Data Integrity

- [x] Metadata remains intact if files move or disappear
- [x] DB records are never implicitly deleted
- [x] Old storage-based code can be removed safely

---

## Milestone 3.4 — Retrieval & Viewing

### Image Retrieval

- [x] Retrieve images from DB in batches
- [x] Implement deterministic ordering
- [x] Ensure UI does not request full dataset
- [x] Support large image collections

---

### Image Viewing

- [x] Load images from original file paths
- [x] Check file availability at view time
- [x] Fail explicitly if file is missing or unreadable
- [x] Missing files do not break browsing

---

## Phase 3 Completion Check

- [x] Images can be imported
- [x] Metadata can be extracted
- [x] Metadata is stored in the database
- [x] Images can be retrieved and viewed
- [x] Legacy app-managed storage code has been removed

---
