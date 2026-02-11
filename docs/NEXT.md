## NEXT — Backend Hardening & Deterministic Expansion

> Rule:
> Work top to bottom.
> Do not start Part 2 before Part 1 is complete.
> Do not start Part 3 before Part 2 is complete.
> UI changes are out of scope unless required for backend validation.

---

# Part 1 — Structured Error Handling & Logging 2.0

Goal: Every failure is classifiable, observable, and reproducible.

## 1. Error Taxonomy

- [ ] Introduce explicit error categories (enum or constants):
  - SCAN_ERROR
  - METADATA_ERROR
  - THUMBNAIL_ERROR
  - DB_WRITE_ERROR
  - FILE_MISSING
  - FILE_PERMISSION_DENIED
  - CORRUPTED_IMAGE
  - UNSUPPORTED_FORMAT

- [ ] Ensure all existing error paths map to one of these categories
- [ ] Remove ad-hoc string-based error logging

---

## 2. Structured Error Context

Every logged error must include:

- [ ] Image ID (if known)

- [ ] File path

- [ ] Operation stage (scan / metadata / thumbnail / db / view)

- [ ] Exception type

- [ ] Timestamp

- [ ] Standardize log format (structured object or consistent pattern)

- [ ] Ensure logs never include raw image data

---

## 3. Recoverable vs Fatal Semantics

- [ ] Define what qualifies as recoverable
- [ ] Define what qualifies as fatal
- [ ] Ensure recoverable errors never abort full scans
- [ ] Ensure fatal errors terminate cleanly with clear logging

---

## 4. Operation Summary Metrics

At the end of every scan:

- [ ] Log total files visited
- [ ] Log valid images indexed
- [ ] Log skipped files (with count by category)
- [ ] Log metadata failures
- [ ] Log DB failures
- [ ] Log total duration

System health must be visible from logs alone.

---

### Completion Check (Part 1)

- [ ] All errors fall into explicit categories
- [ ] Logs are structured and consistent
- [ ] Scan results are diagnosable without reproducing manually
- [ ] No silent failures remain

---

# Part 2 — Deterministic Duplicate Detection (Hash-Based)

Goal: Explicit, predictable duplicate identification.

## 1. Hashing Infrastructure

- [ ] Choose hashing algorithm (e.g., SHA-256)
- [ ] Compute hash from file content (streamed, not full memory load)
- [ ] Store hash in database
- [ ] Ensure hashing failures are logged with proper category

---

## 2. Database Changes

- [ ] Add hash column to image table
- [ ] Backfill hash for existing records
- [ ] Ensure deterministic behavior on re-scan
- [ ] Validate performance impact on large datasets

---

## 3. Duplicate Query Capability

- [ ] Query images grouped by identical hash
- [ ] Expose duplicate detection at repository/service layer
- [ ] Ensure no silent merging or auto-resolution
- [ ] Log duplicate counts during scan (optional but visible)

---

### Completion Check (Part 2)

- [ ] Identical files are reliably detected
- [ ] No probabilistic matching involved
- [ ] Duplicate behavior is explicit and reversible

---

# Part 3 — Minimal Tagging Backend

Goal: Introduce deterministic organization primitives.

## 1. Schema Design

- [ ] Create tags table
- [ ] Create image_tags join table (many-to-many)
- [ ] Enforce referential integrity
- [ ] Add necessary indexes

---

## 2. Tag Operations (Backend Only)

- [ ] Create tag
- [ ] Delete tag
- [ ] Attach tag to image
- [ ] Detach tag from image
- [ ] Prevent duplicate tag assignments

---

## 3. Query Capability

- [ ] Retrieve images by tag
- [ ] Support batch retrieval with tag filter
- [ ] Ensure deterministic ordering remains intact

---

### Completion Check (Part 3)

- [ ] Tags persist across restarts
- [ ] No UI assumptions baked into schema
- [ ] Tag queries scale with batch retrieval

---

# Exit Rule

When all three parts are complete:

1. Update CAPABILITIES.md
2. Update PROJECT_CONTEXT.md if direction has evolved
3. Create a smaller NEXT.md focused on refinement or UI redesign
4. Delete this file

The system must remain deterministic, local-first, and explicit at every stage.
