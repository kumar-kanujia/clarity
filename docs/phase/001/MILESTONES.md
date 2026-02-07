# Phase 1 Milestones — Refactoring, Hardening, Minimal UI

## Overview

Phase 1 focuses on improving **engineering quality** without changing product behavior.

These milestones are designed to:

- Reduce ambiguity during refactoring
- Prevent scope creep
- Provide clear stop conditions

Each milestone must be completed fully before moving to the next.

---

## Milestone 1.1 — Architectural Refactor

### Objective

Restructure the Rust project into clear, enforceable layers while preserving all Phase 0 behavior.

This milestone is successful when the **shape of the codebase communicates intent**.

---

### Required Outcomes

- A clearly defined module structure
- Single, explicit import pipeline
- Business logic isolated from frameworks and IO
- Errors are typed and intentional

---

### Acceptance Criteria

- [ ] UI actions map directly to backend service calls
- [ ] Rust code is refactored for modularity
- [ ] Displayed data always reflects persisted state
- [ ] Restarting the app preserves both data and UI correctness
- [ ] Removing the UI does not affect backend correctness

---

### Disallowed During This Milestone

- Adding tests beyond minimal scaffolding
- Changing functional behavior
- Introducing new features or metadata
- UI work of any kind

If behavior changes, the milestone is considered failed.

---

## Milestone 1.2 — Testing & Hardening

### Objective

Demonstrate that Phase 0 invariants hold under success and failure conditions.

This milestone converts **assumptions into guarantees**.

---

### Required Test Coverage

#### A. Core / Domain Tests

- Metadata extraction accuracy
- Validation logic correctness
- ID and path generation

Constraints:

- No filesystem access
- No database access
- Deterministic and fast

---

#### B. Import Service Tests

- Successful import path
- Failure during file copy
- Failure during metadata extraction
- Failure during database persistence
- Cleanup after partial failure

Constraints:

- Real temporary directories
- Real SQLite database
- No mocks for core behavior

---

#### C. Database Integrity Tests

- Foreign key enforcement
- No orphaned metadata records
- Deleting an image cascades correctly

Constraints:

- Real schema
- Real migrations

---

### Acceptance Criteria

- [ ] Tests fail if invariants are violated
- [ ] Failure scenarios are explicitly tested
- [ ] Tests are readable and intention-revealing
- [ ] Test setup mirrors real runtime behavior

---

### Disallowed During This Milestone

- UI development
- Performance benchmarking
- Snapshot or visual tests
- Over-mocking

If a test requires heavy mocking, refactor instead.

---

## Milestone 1.3 — Minimal Frontend

### Objective

Validate backend architecture and integration through a minimal, deliberately constrained UI.

The frontend exists to **prove wiring**, not to deliver UX value.

---

### Required UI Capabilities

- Single screen
- Import images trigger
- Display persisted image data:
  - Original filename
  - File size
  - Import timestamp

---

### Acceptance Criteria

- [ ] UI triggers backend services only
- [ ] No business logic exists in frontend code
- [ ] Displayed data matches persisted state
- [ ] App restart preserves UI state

---

### Explicitly Disallowed

- Image previews or thumbnails
- Sorting, filtering, or grouping
- Drag-and-drop
- State management complexity
- UI polish or animations

If the UI becomes "interesting", it is too complex.

---

## Phase 1 Acceptance Criteria

Phase 1 is considered **successful** only if _all_ of the following are true:

- [ ] The Rust project is cleanly layered and easy to navigate
- [ ] Phase 0 behavior is preserved with no regressions
- [ ] Core invariants are enforced by tests, not convention
- [ ] Import failures never leave partial files or records
- [ ] Tests are reliable, readable, and fast enough to run frequently
- [ ] The frontend is minimal and contains no business logic
- [ ] Restarting the app never corrupts or loses state
- [ ] You can confidently refactor a module without fear of hidden coupling

Failing any single item means Phase 1 is **not complete**.

---

## Phase 1 Exit Criteria

Phase 1 is complete when:

- Architectural boundaries are clear and enforced
- Phase 0 invariants are protected by tests
- Failures leave no corrupted files or records
- Minimal UI works end-to-end without hacks
- The codebase feels predictable and safe to change

Only after meeting these criteria may Phase 2 planning begin.
