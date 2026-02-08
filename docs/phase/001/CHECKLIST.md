# Phase 1 — Working Checklist

This checklist is the **day-to-day reference** for Phase 1.
If an item is not checked, Phase 1 is not done.

---

## Milestone 1.1 — Architectural Refactor

- [x] Phase 0 behavior is preserved (no regressions)
- [x] Each source file belongs clearly to one architectural layer
- [x] Domain / core code has **no filesystem dependencies**
- [x] Domain / core code has **no database dependencies**
- [x] Domain / core code has **no UI or framework dependencies**
- [x] Tauri commands contain no business logic
- [x] Import workflow exists in exactly one service module
- [x] Dependency direction is one-way (no cycles)
- [x] Errors crossing layer boundaries are typed and intentional
- [x] Code navigation feels obvious and predictable

---

## Milestone 1.2 — Testing & Hardening

### Core / Domain Tests

- [x] Metadata extraction is tested and accurate
- [x] Validation logic is tested
- [x] ID generation is tested
- [x] Path generation logic is tested
- [x] Core tests use no filesystem
- [x] Core tests use no database

### Import Service Tests

- [x] Successful import path is tested
- [x] Failure during file copy is tested
- [x] Failure during metadata extraction is tested
- [x] Failure during database persistence is tested
- [x] Partial failures leave no files behind
- [x] Partial failures leave no database records behind

---

## Milestone 1.3 — Minimal Frontend

- [x] UI consists of a single screen
- [x] UI provides an "Import images" action

---

## Phase 1 Acceptance (Global)

- [x] Project structure is clear and consistent
- [x] Phase 0 invariants are enforced by code and tests
- [x] Failures never corrupt filesystem state
- [x] Failures never corrupt database state
- [x] Minimal UI works end-to-end without hacks
- [x] The codebase feels safe and predictable to modify

---

**Rule:** If any item here is unchecked, Phase 1 is still in progress.
