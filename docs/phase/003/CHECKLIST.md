# CHECKLIST.md

## Phase 3 — Image Indexing & Metadata

> Rule: Work **top to bottom**.
> If an item above is not done, do not start items below it.

---

## Milestone 3.1 — File Import (Reference-Based)

### File Import

- [ ] Allow user to select one or more image files
- [ ] Register selected files in the database
- [ ] Do not copy, move, or mutate user files
- [ ] Validate files are readable at import time
- [ ] Reject unsupported image formats explicitly

---

### Image Identity

- [ ] Assign a stable internal image ID
- [ ] Ensure DB records use internal ID as primary reference
- [ ] Ensure identity survives restarts
- [ ] Allow DB entries to exist even if file becomes unavailable later

---

## Milestone 3.2 — Metadata Extraction

### Metadata Collection

- [ ] Extract basic image metadata on import
- [ ] Store image dimensions
- [ ] Store file size
- [ ] Store image format
- [ ] Capture filesystem timestamps (best-effort)

---

### Metadata Robustness

- [ ] Metadata extraction failures do not block import
- [ ] Allow metadata to be re-extracted
- [ ] Missing metadata is handled explicitly

---

## Milestone 3.3 — Database Persistence

### Database as Source of Truth

- [ ] Persist image records and metadata reliably
- [ ] Ensure one DB row per image ID
- [ ] Ensure updates do not touch filesystem
- [ ] Verify DB state survives restarts

---

### Data Integrity

- [ ] Metadata remains intact if files move or disappear
- [ ] DB records are never implicitly deleted
- [ ] Old storage-based code can be removed safely

---

## Milestone 3.4 — Retrieval & Viewing

### Image Retrieval

- [ ] Retrieve images from DB in batches
- [ ] Implement deterministic ordering
- [ ] Ensure UI does not request full dataset
- [ ] Support large image collections

---

### Image Viewing

- [ ] Load images from original file paths
- [ ] Check file availability at view time
- [ ] Fail explicitly if file is missing or unreadable
- [ ] Missing files do not break browsing

---

## Phase 3 Completion Check

- [ ] Images can be imported
- [ ] Metadata can be extracted
- [ ] Metadata is stored in the database
- [ ] Images can be retrieved and viewed
- [ ] Legacy app-managed storage code has been removed

---
