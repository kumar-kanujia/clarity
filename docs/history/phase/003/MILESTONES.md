# MILESTONES.md

## Phase 3 — Image Indexing & Metadata

Phase 3 focuses on **what the app can do**, not how it owns files.

Each milestone unlocks clear user-facing capability and leaves the system in a usable state.

---

## Milestone 3.1 — File Import

### Objective

Allow users to import image files into the application without transferring ownership.

---

### Scope

This milestone covers:

- File selection
- Reference-based import
- Stable image identity

---

### What Changes

- Images are registered in the database
- Files remain in their original locations
- Each image receives a stable internal ID
- Import behavior is fast and predictable

---

### Exit Criteria

- Imported images appear in the app
- Restarting the app preserves imports
- No file copying or app-managed storage exists

---

## Milestone 3.2 — Metadata Extraction

### Objective

Extract and persist meaningful image metadata.

---

### Scope

This milestone covers:

- Basic image properties
- Safe extraction behavior
- Metadata persistence

---

### What Changes

- Metadata is extracted during import
- Extraction failures are isolated
- Metadata can be re-generated if needed

---

### Exit Criteria

- Metadata is visible and persisted
- Missing metadata does not break features
- Metadata extraction is no longer experimental

---

## Milestone 3.3 — Database as Source of Truth

### Objective

Ensure the database fully represents the app’s image state.

---

### Scope

This milestone covers:

- Persistent image records
- Metadata integrity
- Removal of storage assumptions

---

### What Changes

- All app behavior is DB-driven
- Files are treated as read-only dependencies
- Legacy storage logic can be deleted

---

### Exit Criteria

- DB state survives restarts
- File movement does not corrupt metadata
- No feature depends on app-managed storage

---

## Milestone 3.4 — Retrieval & Viewing

### Objective

Enable scalable browsing and reliable viewing of images.

---

### Scope

This milestone covers:

- Batch-based retrieval
- Deterministic ordering
- Explicit failure handling

---

### What Changes

- Images are retrieved in batches
- Viewing checks file availability at render time
- Missing files fail clearly and safely

---

### Exit Criteria

- Large image libraries can be browsed
- Image viewing is predictable
- Missing files do not destabilize the app

---

## Phase 3 Completion Criteria

Phase 3 is complete when:

- Images are imported by reference
- Metadata extraction is stable
- The database is authoritative
- Images can be retrieved and viewed
- Storage-heavy legacy code is gone

---
