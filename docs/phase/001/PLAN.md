# Phase 1 Plan — Refactoring, Hardening, Minimal UI

## Purpose

Phase 1 exists to **improve engineering quality**, not to add features.

The functional behavior established in Phase 0 must remain intact. The focus of this phase is to make the system:

- Structurally clear
- Testable
- Trustworthy
- Safe to evolve

This plan defines **what work is allowed** and **how success is measured**.

---

## Phase 1 Scope

Phase 1 includes **only** the following categories of work:

1. Architectural refactoring
2. Testing and hardening of Phase 0 behavior
3. A minimal frontend to validate end-to-end integration

Any work outside these categories is out of scope.

---

## Milestone 1.1 — Architectural Refactor

### Goal

Restructure the Rust project into clear, enforceable layers without changing observable behavior.

This milestone improves **code shape**, not functionality.

---

### Included

- Define clear architectural layers (domain, storage, database, services, app boundary)
- Move existing code into appropriate layers
- Remove business logic from Tauri commands
- Centralize the image import pipeline
- Introduce explicit error types at layer boundaries

---

### Excluded

- Feature changes
- Performance optimizations
- New metadata fields
- UI work
- Test additions (except minimal scaffolding if required)

---

### Completion Checklist

- [ ] Each module has a clear responsibility
- [ ] No domain logic depends on filesystem, database, or UI
- [ ] Tauri commands act as thin adapters only
- [ ] Import logic exists in exactly one place
- [ ] Code navigation feels obvious

---

## Milestone 1.2 — Testing & Hardening

### Goal

Prove that Phase 0 invariants hold under normal operation and failure conditions.

Tests exist to enforce correctness, not to inflate coverage numbers.

---

### Required Test Categories

#### 1. Core / Domain Tests

- Metadata extraction correctness
- Validation logic
- ID and path generation

Characteristics:

- Pure or near-pure logic
- No filesystem
- No database

---

#### 2. Import Service Tests

- Successful image import
- Failure during file copy
- Failure during metadata extraction
- Failure during database persistence
- Recovery after partial failure

Characteristics:

- Real temporary directories
- Real SQLite database
- Explicit failure simulation

---

#### 3. Database Integrity Tests

- Foreign key enforcement
- No orphaned metadata records
- Deleting an image removes metadata

Characteristics:

- Real schema
- No mocks

---

### Excluded

- Performance benchmarks
- UI tests
- Snapshot tests
- Fuzzing

---

### Completion Checklist

- [ ] Tests fail when invariants are violated
- [ ] Tests are readable and intention-revealing
- [ ] Tests do not rely on mocks for core behavior
- [ ] Test failures clearly explain what broke

---

## Milestone 1.3 — Minimal Frontend

### Goal

Validate backend architecture and integration through a deliberately minimal UI.

The frontend is **not** a product surface in this phase.

---

### UI Scope

- Single screen
- Import images action
- Display a simple list of imported images:
  - Original filename
  - File size
  - Import timestamp

---

### Explicitly Excluded

- Image previews or thumbnails
- Sorting or filtering
- Drag-and-drop
- State management complexity
- UX polish

---

### Completion Checklist

- [ ] UI triggers backend workflows only
- [ ] No business logic exists in the frontend
- [ ] UI reflects persisted state accurately
- [ ] Restarting the app preserves displayed data

---

## Phase 1 Definition of Done

Phase 1 is complete when:

- Project structure is clean and consistent
- Phase 0 invariants are enforced by code and tests
- Failures leave no corrupted state
- A minimal UI works end-to-end without hacks
- The codebase feels safe and predictable to modify

Only after these conditions are met may Phase 2 planning begin.
