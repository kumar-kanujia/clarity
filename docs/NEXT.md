# NEXT — Bulk Operations and Multi-Selection Support

Context: Core backend functionality is complete and production-ready. Event-driven workers, full tag lifecycle, thumbnail pipeline, and permanent delete all function correctly.

This phase upgrades the system to support deterministic bulk state transitions across multiple images. This enables efficient tagging, bin operations, permanent deletion, and prepares the system for duplicate resolution workflows.

Bulk operations are backend primitives. UI selection must invoke these primitives and must not implement operational logic.

Rule:
Work top to bottom.
Do not skip sections.
Do not introduce implicit behavior.
All state transitions must remain explicit, deterministic, and observable.

---

# SECTION 1 — Bulk Operations Backend

Goal: Implement deterministic bulk state transition primitives at the backend layer.

Bulk operations must execute within a single database transaction.
Bulk operations must never internally call single-item operations.

---

## Part 1.1 — Bulk Soft Delete

- [x] Define bulk soft delete operation
- [x] Operation accepts arbitrary list of image IDs
- [x] Mark all specified images as soft-deleted
- [x] Do not modify images already soft-deleted
- [x] Do not modify original files on disk
- [x] Execute operation in single database transaction
- [x] Emit structured log for operation

Completion Check:

- [x] Bulk soft delete deterministic
- [x] No partial state transitions possible
- [x] Referential integrity preserved

---

## Part 1.2 — Bulk Restore

- [x] Define bulk restore operation
- [x] Operation accepts arbitrary list of image IDs
- [x] Restore all specified soft-deleted images
- [x] Do not affect already-active images
- [x] Execute operation in single database transaction
- [x] Emit structured log

Completion Check:

- [x] Restore fully reversible
- [x] Image identity and relationships preserved

---

## Part 1.3 — Bulk Permanent Delete

- [x] Define bulk permanent delete operation
- [x] Operation accepts arbitrary list of image IDs
- [x] Remove image records from database
- [x] Remove tag assignments
- [x] Remove favorite state
- [x] Remove pipeline state
- [x] Remove duplicate relationships
- [x] Execute operation in single database transaction
- [x] Emit structured log

Completion Check:

- [x] Images fully removed from system state
- [x] No orphan records exist

---

## Part 1.4 — Bulk Tag Attach

- [x] Define bulk tag attach operation
- [x] Operation accepts image ID list and tag ID
- [x] Assign tag to all specified images
- [x] Prevent duplicate tag assignments
- [x] Execute operation in single database transaction
- [x] Emit structured log

Completion Check:

- [x] Tag assignment deterministic
- [x] Referential integrity preserved

---

## Part 1.5 — Bulk Tag Removal

- [x] Define bulk tag removal operation
- [x] Operation accepts image ID list and tag ID
- [x] Remove tag from specified images only
- [x] Execute operation in single database transaction
- [x] Emit structured log

Completion Check:

- [x] Tag removal deterministic
- [x] Referential integrity preserved

---

# SECTION 2 — Multi-Selection UI Integration

Goal: Integrate deterministic multi-selection with backend bulk operations.

UI must maintain selection state independently.
UI must invoke backend bulk operations exclusively.
UI must not implement state transition logic.

---

## Part 2.1 — Selection Model

- [ ] Support single selection
- [ ] Support multi-selection
- [ ] Support range selection
- [ ] Support select all
- [ ] Support selection clearing

Completion Check:

- [ ] Selection model fully functional
- [ ] Selection state deterministic and reliable

---

## Part 2.2 — Bulk Action Integration

- [ ] Bulk tag attach from selection
- [ ] Bulk tag removal from selection
- [ ] Bulk soft delete from selection
- [ ] Bulk restore from selection
- [ ] Bulk permanent delete from selection

Completion Check:

- [ ] UI invokes backend bulk operations correctly
- [ ] No behavioral differences between single and bulk operations

---

# SECTION 3 — Cache Consistency and Reliability Validation

Goal: Ensure cache consistency and validate reliability of bulk operations.

---

## Part 3.1 — Thumbnail Cache Consistency

- [ ] Delete thumbnail cache files for permanently deleted images
- [ ] Thumbnail cleanup occurs only after database delete succeeds
- [ ] Ensure cleanup failure does not corrupt database state
- [ ] Emit structured log for cleanup

Completion Check:

- [ ] No orphan thumbnail files remain
- [ ] Cache consistent with database

---

## Part 3.2 — Bulk Operation Reliability Validation

- [ ] Validate bulk soft delete
- [ ] Validate bulk restore
- [ ] Validate bulk permanent delete
- [ ] Validate bulk tag attach
- [ ] Validate bulk tag removal

Completion Check:

- [ ] All bulk operations deterministic
- [ ] All bulk operations reliable

---

## Part 3.3 — Failure Scenario Validation

- [ ] Validate behavior under database interruption
- [ ] Validate behavior under worker interaction
- [ ] Validate behavior under partial system failure

Completion Check:

- [ ] System remains consistent
- [ ] No orphan state created

---

# Exit Rule

When all sections are complete:

- [ ] Update CAPABILITIES.md
- [ ] Promote bulk operations to production capability
- [ ] Archive this file
- [ ] Create new NEXT.md for duplicate detection phase

System must remain:

- Deterministic
- Local-first
- Explicit
- Observable
- Reliable
