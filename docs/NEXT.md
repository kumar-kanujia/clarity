# NEXT.md

## Immediate Work Queue (Execution-Oriented)

> Rule:
> Work **top to bottom**.
> Do not start Part 2 until Part 1 is complete.
> This file reflects _current implementation reality_, not future architecture.

---

## Part 1 — Error Handling, Overhead Control & Logging

### 1. Error Handling (Concrete, Not Abstract)

Focus only on **paths you already execute**.

#### Import / Scan

- [x] Handle unreadable files explicitly (permission, locked files)
- [x] Handle broken symlinks or invalid paths
- [x] Skip unsupported image formats with a clear reason
- [x] Ensure one bad file does not fail a full scan

#### Metadata Extraction

- [x] Handle image decode failures safely
- [x] Ensure partial metadata does not crash DB writes
- [x] Store “metadata unavailable” state instead of failing

#### Database

- [x] Handle DB insert/update failures explicitly
- [x] Ensure partial batch inserts are visible (not silent)
- [x] Prevent crashes on malformed records

---

### 2. Overhead & Performance Guardrails (Minimal)

- [x] Ensure scans are streaming / iterative (not all in memory)
- [x] Ensure batch size is enforced everywhere
- [x] Avoid decoding full images when extracting metadata
- [x] Guard against extremely large folders (timeouts or chunking)

---

### 3. Logging (Developer-Focused)

Logging is for **you**, not users (yet).

- [x] Introduce log levels: info / warn / error
- [x] Log scan start + completion (counts only)
- [x] Log skipped files with reason
- [x] Log fatal failures with enough context to reproduce
- [x] Ensure logs never include raw image data

---

### Completion Check (Part 1)

- [x] App never crashes on bad files
- [x] Failures are visible in logs
- [x] Large scans feel predictable
- [x] You trust the system to keep running

---

## Part 2 — Thumbnails & Gallery View

### 1. Thumbnail Extraction (Incremental)

Keep this intentionally simple.

- [x] Decide one thumbnail size (single constant)
- [x] Extract thumbnail only when needed
- [x] Do not block scanning or DB operations
- [x] Handle extraction failure without retries
- [x] Associate thumbnail with image ID
- [x] Store thumbnails in cache

### 2. Gallery View (Minimal Viable)

This is not a “photo app UI” yet — it’s a **visual index**.

- [x] Display thumbnails in a grid
- [x] Load thumbnails lazily as they appear
- [x] Respect batch retrieval
- [x] Handle missing thumbnails gracefully
- [x] Keep layout simple and predictable

---

### Completion Check (Part 2)

- [x] Gallery loads quickly for large sets
- [x] Scrolling does not degrade
- [x] Thumbnail failures don’t break layout
- [x] Code remains delete-friendly

---

## Part 3 — Navigation & Notifications

### 1. Navigation (Concrete)

- [x] Open image from gallery
- [x] Navigate next / previous using current ordering
- [x] Navigation respects batch boundaries
- [x] Missing file shows explicit error state

---

### 2. Notifications (Minimal & Honest)

Notifications exist to **explain failures**, not celebrate success.

- [x] Surface scan/import failures
- [x] Surface missing-file errors when viewing
- [x] Ensure notifications are dismissible
- [x] Avoid modal dialogs unless blocking

---

### Completion Check (Part 3)

- [x] Navigation feels predictable
- [x] Errors are visible but not annoying
- [x] No critical failures are silent

---

## Exit Rule

When **all three parts** are complete:

1. Delete this file
2. Update `CAPABILITIES.md`
3. Create a **new, smaller `NEXT.md`**

---
