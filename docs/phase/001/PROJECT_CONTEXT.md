# Project Context — Clarity

## Project Overview

Clarity is a **local-first image management application**.

The application **fully owns all imported images** by copying them into app-managed storage.
Once imported, the app **never depends on original file locations** and never modifies user files.

The project is developed in **strict phases**.
Each phase must be completed and stabilized before moving forward.

---

## Phase Definitions

### Phase 1 — Refactoring, Hardening, Minimal UI (Current)

Phase 1 focuses on **engineering quality**, not new features.

The goal is to turn existing Phase 0 functionality into a system that is:

- Structurally clear
- Testable
- Trustworthy
- Ready for future phases

No new product capabilities are introduced in Phase 1.

---

## Phase 1 Goals

By the end of Phase 1:

1. The Rust project is **cleanly layered**
2. Phase 0 invariants are **enforced by architecture**
3. Critical workflows are **covered by meaningful tests**
4. A **minimal frontend** validates end-to-end integration
5. The codebase is easy to reason about and modify

---

## Explicitly Out of Scope for Phase 1

To prevent scope creep, Phase 1 **must not include**:

- New metadata fields
- Thumbnails or previews
- Background jobs
- Hashing or duplicate detection
- Similarity search or ML features
- Performance optimizations
- UX polish or UI experimentation

If a change does not improve **structure, testability, or confidence**, it does not belong in Phase 1.

---

## Core Architectural Principles

These principles are **non-negotiable** and apply to all phases.

### 1. Local-First

- All data is stored locally
- No cloud dependency
- No external services required for correctness

### 2. App-Owned Storage

- The app is the single source of truth
- Original user files are never modified
- The app does not rely on external paths after import

### 3. Strong Invariants

The system must always guarantee:

- No image exists without metadata
- No metadata exists without an image
- Partial imports are impossible
- Failures leave the system in a clean state

### 4. Layered Architecture

- Domain logic is independent of IO
- File system, database, and UI are boundary layers
- Business logic never lives in UI or framework code

### 5. Phase Discipline

- Each phase has a fixed scope
- Completed phases are not re-scoped
- New ideas are deferred, not “snuck in”

---

## Testing Philosophy (Phase 1)

Testing exists to **enforce invariants**, not to chase coverage numbers.

- Prefer real SQLite over mocks
- Prefer temp directories over fake filesystems
- Tests should make invariant violations obvious
- If something is hard to test, the structure is wrong

---

## Frontend Philosophy (Phase 1)

The frontend exists only to:

- Trigger backend workflows
- Display persisted results
- Prove integration correctness

The frontend must **not**:

- Contain business logic
- Compensate for backend design flaws
- Define system behavior

---

## Decision Authority

This document is the **highest-level source of truth**.

If future planning, implementation, or discussion conflicts with this document:

- This document wins
- The conflict must be resolved explicitly
- Silent divergence is not acceptable

---

## Phase 1 Exit Criteria

Phase 1 is complete when:

- The project structure is obvious and consistent
- Core invariants are enforced by code and tests
- Failures do not corrupt state
- A minimal UI works without hacks
- The codebase feels safe to evolve

Only after meeting these criteria can Phase 2 planning begin.
