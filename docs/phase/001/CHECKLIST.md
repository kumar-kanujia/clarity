# Phase 1 — Working Checklist

This checklist is the **day-to-day reference** for Phase 1.
If an item is not checked, Phase 1 is not done.

---

## Milestone 1.1 — Architectural Refactor

- [ ] Phase 0 behavior is preserved (no regressions)
- [ ] Each source file belongs clearly to one architectural layer
- [ ] Domain / core code has **no filesystem dependencies**
- [ ] Domain / core code has **no database dependencies**
- [ ] Domain / core code has **no UI or framework dependencies**
- [ ] Tauri commands contain no business logic
- [ ] Import workflow exists in exactly one service module
- [ ] Dependency direction is one-way (no cycles)
- [ ] Errors crossing layer boundaries are typed and intentional
- [ ] Code navigation feels obvious and predictable

---

## Milestone 1.2 — Testing & Hardening

### Core / Domain Tests

- [ ] Metadata extraction is tested and accurate
- [ ] Validation logic is tested
- [ ] ID generation is tested
- [ ] Path generation logic is tested
- [ ] Core tests use no filesystem
- [ ] Core tests use no database

### Import Service Tests

- [ ] Successful import path is tested
- [ ] Failure during file copy is tested
- [ ] Failure during metadata extraction is tested
- [ ] Failure during database persistence is tested
- [ ] Partial failures leave no files behind
- [ ] Partial failures leave no database records behind

### Database Integrity Tests

- [ ] Foreign key constraints are enforced
- [ ] No orphaned metadata records are possible
- [ ] Deleting an image removes associated metadata

### Test Quality

- [ ] Tests fail when Phase 0 invariants are violated
- [ ] Tests use real SQLite
- [ ] Tests use temporary directories
- [ ] Tests are deterministic and repeatable
- [ ] Test failures clearly explain what broke

---

## Milestone 1.3 — Minimal Frontend

- [ ] UI consists of a single screen
- [ ] UI provides an "Import images" action
- [ ] UI displays original filename
- [ ] UI displays file size
- [ ] UI displays import timestamp
- [ ] UI triggers backend services only
- [ ] Frontend contains **no business logic**
- [ ] Displayed data reflects persisted state
- [ ] App restart preserves UI correctness
- [ ] Removing the UI does not affect backend correctness

---

## Phase 1 Acceptance (Global)

- [ ] Project structure is clear and consistent
- [ ] Phase 0 invariants are enforced by code and tests
- [ ] Failures never corrupt filesystem state
- [ ] Failures never corrupt database state
- [ ] Minimal UI works end-to-end without hacks
- [ ] The codebase feels safe and predictable to modify

---

**Rule:** If any item here is unchecked, Phase 1 is still in progress.
