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

- [x] Introduce explicit error categories (enum or constants):
  - SCAN_ERROR
  - JOIN_ERROR
  - THUMBNAIL_ERROR
  - DATABASE_ERROR

- [x] Ensure all existing error paths map to one of these categories
- [x] Remove ad-hoc string-based error logging

---

## 2. Structured Error Context

Every logged error must include:

- [x] Image ID (if known)

- [x] File path

- [x] Operation stage (scan / metadata / thumbnail / db / view)

- [x] Exception type

- [x] Timestamp

- [x] Standardize log format (structured object or consistent pattern)

- [x] Ensure logs never include raw image data

---

## 3. Recoverable vs Fatal Semantics

- [x] Define what qualifies as recoverable
- [x] Define what qualifies as fatal
- [x] Ensure recoverable errors never abort full scans
- [x] Ensure fatal errors terminate cleanly with clear logging

---

## 4. Operation Summary Metrics

At the end of every scan:

- [x] Log total files visited
- [x] Log valid images indexed
- [x] Log skipped files (with count by category)
- [x] Log metadata failures
- [x] Log DB failures
- [x] Log total duration

System health must be visible from logs alone.

---

### Completion Check (Part 1)

- [x] All errors fall into explicit categories
- [x] Logs are structured and consistent
- [x] Scan results are diagnosable without reproducing manually
- [x] No silent failures remain

---

# Part 2 — Deterministic Duplicate Detection (Hash-Based)

Goal: Explicit, predictable duplicate identification.

## 1. Hashing Infrastructure

- [x] Choose hashing algorithm (e.g., SHA-256)
- [x] Compute hash from file content (streamed, not full memory load)
- [x] Store hash in database
- [x] Ensure hashing failures are logged with proper category

---

## 2. Database Changes

- [x] Add hash column to image table
- [x] Backfill hash for existing records
- [x] Ensure deterministic behavior on re-scan
- [x] Validate performance impact on large datasets

---

## 3. Duplicate Query Capability

- [x] Query images grouped by identical hash
- [x] Expose duplicate detection at repository/service layer
- [x] Ensure no silent merging or auto-resolution
- [x] Log duplicate counts during scan (optional but visible)

---

### Completion Check (Part 2)

- [x] Identical files are reliably detected
- [x] No probabilistic matching involved
- [x] Duplicate behavior is explicit and reversible

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
