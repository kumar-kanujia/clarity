# CHECKLIST.md

## Phase 2 — Import & Storage Scaling

> Rule: Work **top to bottom**.
> If an item above is not done, do not start items below it.

---

## Milestone 2.1 — Identity, Storage, Import Backbone

### Internal Identity

- [x] Define a stable internal image ID
- [x] Ensure DB records use internal ID as primary reference
- [x] Ensure UI logic does not rely on filesystem paths
- [x] Verify IDs remain stable across restarts

---

### Storage Layout

- [x] Decide deterministic subfolder strategy
- [x] Implement non-flat storage structure
- [x] Prevent filename collisions
- [x] Ensure storage layout is independent of source paths
- [x] Verify existing images still resolve correctly

---

### Unified Import Pipeline

- [x] Normalize single-file selection into import pipeline
- [x] Normalize multi-file selection into import pipeline
- [] Normalize multi-directory selection into import pipeline
- [ ] Handle mixed selection (files + directories)
- [ ] Prevent duplicate scans for overlapping directories
- [ ] Ensure import failure leaves no partial state

---

## Milestone 2.2 — Duplicate Control & Import Feedback

### Exact Duplicate Detection

- [ ] Define what counts as “same file” (content-based)
- [ ] Detect duplicates during import
- [ ] Ensure duplicate detection runs before file copy
- [ ] Verify no duplicate DB entries are created accidentally

---

### Explicit Import Modes

- [ ] Define supported import modes
- [ ] Implement “skip duplicate” behavior
- [ ] Implement “reuse existing record” behavior
- [ ] Implement “abort on duplicate” behavior
- [ ] Ensure behavior is explicit, not implicit

---

### Import Summary

- [ ] Track total files scanned
- [ ] Track files imported
- [ ] Track files skipped
- [ ] Track files failed
- [ ] Surface summary after import completes

---

## Milestone 2.3 — Retrieval, Viewing, Transparency

### Batch-Based Retrieval

- [ ] Define batch size handling
- [ ] Implement deterministic ordering
- [ ] Retrieve images batch-wise from DB
- [ ] Ensure UI does not request full dataset
- [ ] Verify batch retrieval across restarts

---

### Reliable Image Viewing

- [ ] Map DB records to filesystem via internal ID
- [ ] Verify file exists before display
- [ ] Handle missing file explicitly
- [ ] Ensure viewing never depends on original paths

---

### Read-Only Storage Inspection

- [ ] Expose storage root path (read-only)
- [ ] Display folder structure
- [ ] Display file counts
- [ ] Ensure no mutation is possible from inspection

---

## Phase 2 Completion Check

- [ ] Import large sets without manual babysitting
- [ ] Storage layout scales cleanly
- [ ] Duplicate imports behave predictably
- [ ] Image retrieval works in batches
- [ ] App feels safe to use on a real image library

---
