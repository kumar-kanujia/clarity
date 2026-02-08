# MILESTONES.md

## Phase 2 — Import & Storage Scaling

Phase 2 is split into three milestones.
Each milestone builds on the previous one and leaves the system in a usable state. The focus is correctness, safety, and scalability.

---

## Milestone 2.1 — Identity, Storage, and Import Backbone

### Objective

Establish stable foundations for how images are identified, stored, and imported.

This milestone removes ambiguity from the system by defining **what an image is internally** and **where it lives**.

---

### Scope

This milestone covers:

- Stable internal image identity
- Deterministic storage layout
- A single, unified import pipeline
- Improved selection of files and directories

---

### What Changes

- Every imported image is assigned a **stable internal ID**
- All internal logic (DB, UI, filesystem mapping) relies on this ID
- Images are stored in a **structured subfolder layout**, not a flat directory
- Storage layout is independent of original file paths
- Import logic is centralized and normalized:
  - Single files
  - Multiple files
  - Multiple directories
  - Mixed selections

- Overlapping directory scans are handled safely

---

### What This Enables

- Safe duplicate detection
- Batch-based retrieval
- Predictable navigation
- Long-term scalability of storage

---

### Exit Criteria

- Internal image identity is stable across restarts
- Storage layout is deterministic and collision-safe
- Import behavior is consistent regardless of selection type
- No partial files or database records are left on failure

---

## Milestone 2.2 — Duplicate Control and Import Feedback

### Objective

Make import behavior **explicit, predictable, and transparent**.

This milestone ensures that importing the same data twice never creates confusion.

---

### Scope

This milestone covers:

- Exact duplicate file detection
- Explicit import modes
- Import result reporting

---

### What Changes

- The system detects **identical files** during import
- Duplicate detection is based on file content, not filename or path
- Import behavior is explicit and configurable:
  - Skip existing files
  - Reuse existing records
  - Abort on duplicate

- Every import produces a **clear summary**:
  - Files scanned
  - Files imported
  - Files skipped
  - Files failed

---

### What This Enables

- Safe re-imports
- User trust in bulk operations
- Easier debugging of import issues

---

### Exit Criteria

- Duplicate imports never create ambiguous state
- Import behavior is intentional, not implicit
- Users can clearly see what happened during an import
- Import failures are visible and explainable

---

## Milestone 2.3 — Retrieval, Viewing, and Transparency

### Objective

Make stored images easy and safe to consume without loading everything at once.

This milestone focuses on **using** the data that has already been imported.

---

### Scope

This milestone covers:

- Batch-based image retrieval
- Reliable image viewing
- Read-only storage inspection

---

### What Changes

- Images are retrieved in fixed-size batches
- Ordering is deterministic and stable
- UI never requests the entire collection at once
- Viewing an image always maps correctly from DB to filesystem
- Missing or corrupted files fail explicitly
- Users can inspect storage:
  - Storage root
  - Folder structure
  - File counts

- Storage inspection is strictly read-only

---

### What This Enables

- Scalable browsing
- Predictable navigation
- Greater transparency into how data is stored

---

### Exit Criteria

- Large image collections can be browsed safely
- Image viewing is reliable and explicit about failures
- Storage layout is visible without allowing mutation
- The system feels usable without needing special care

---

## Phase 2 Completion Criteria

Phase 2 is considered complete when:

- Importing large image sets is safe and predictable
- Storage scales without manual cleanup
- Duplicate handling is explicit
- Image retrieval works in batches
- The system can be used confidently on real image libraries

---
