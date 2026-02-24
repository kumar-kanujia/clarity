# NEXT — Worker Upgrade, Tag System Expansion, and Hard Delete Support

Context: Core backend functionality is complete and stable. Processing pipeline, tagging, and soft delete exist and function correctly.

This phase focuses on:

- Upgrading worker system from loop-based to event-driven
- Expanding tag system with restore and permanent delete
- Supporting permanent image deletion

Rule:
Work top to bottom.
Do not skip sections.
Do not introduce implicit behavior.
UI work is out of scope except data layer integration.

---

# SECTION 1 — Event-Driven Worker System Upgrade

Goal: Replace loop-based workers with event-driven processing.

Workers must execute only when work exists, not continuously poll.

---

## Part 1.1 — Event-Driven Worker Architecture

- [x] Define worker event system
- [x] Define event types for pipeline stages
- [x] Ensure workers sleep when no work exists
- [x] Ensure workers wake immediately when work is available
- [x] Remove loop-based polling logic

Completion Check:

- [x] No continuous polling exists
- [x] Workers activate only when events occur
- [x] Worker behavior deterministic

---

## Part 1.2 — Pipeline Event Integration

Events must be emitted when pipeline work becomes available.

- [x] Emit event when image enters Pending state
- [x] Emit event when hashing completes
- [x] Emit event when thumbnail generation becomes available
- [x] Ensure events emitted only after DB commit succeeds
- [x] Ensure duplicate events do not cause duplicate processing

Completion Check:

- [x] All pipeline stages triggered by events
- [x] No missed processing
- [x] No duplicate processing

---

## Part 1.3 — Worker Reliability and Safety

- [x] Ensure worker crash isolation remains intact
- [x] Ensure retry logic continues to function
- [x] Ensure failed items do not block worker
- [x] Ensure worker restart resumes processing correctly

Completion Check:

- [x] Worker system reliable and fault-tolerant
- [x] Worker system fully event-driven

---

# SECTION 2 — Tag System Expansion

Goal: Complete tag delete, restore, and permanent delete functionality.

Soft delete already exists.

---

## Part 2.1 — Retrieve Deleted Tags

- [x] Retrieve deleted tags
- [x] Retrieve active tags only
- [x] Retrieve all tags (active and deleted)
- [ ] ~~Support sorting and pagination of deleted tags~~ Not in scope

Completion Check:

- [ ] Deleted tags fully observable

---

## Part 2.2 — Restore Deleted Tag

- [x] Restore deleted tag
- [x] Restore preserves tag ID
- [x] Restore preserves tag assignments
- [x] Restore fails safely if tag conflict exists

Completion Check:

- [x] Tag restore reliable
- [x] Tag relationships preserved

---

## Part 2.3 — Permanent Tag Delete

- [x] Permanently delete tag record
- [x] Remove all tag assignments
- [x] Ensure referential integrity maintained
- [x] Ensure no orphan tag references remain

Completion Check:

- [x] Tag fully removed from system

---

# SECTION 3 — Permanent Image Delete

Goal: Support permanent removal of image records from system.

Permanent delete affects database and derived data only.
Original files on disk must not be deleted.

---

## Part 3.1 — Permanent Image Delete Operation

- [x] Permanently delete image record
- [x] Remove tag assignments
- [x] Remove favorite state
- [x] Remove pipeline state
- [x] Remove duplicate relationships

Completion Check:

- [x] Image fully removed from database
- [x] No orphan references remain

---

## Part 3.2 — Thumbnail Cleanup

- [x] Delete thumbnail cache for permanently deleted image
- [x] Ensure no orphan thumbnail files remain

Completion Check:

- [x] Thumbnail cache consistent with database

---

## Part 3.3 — Permanent Delete Safety

- [x] Permanent delete requires explicit operation
- [x] Permanent delete fully logged
- [x] Permanent delete deterministic

Completion Check:

- [x] No unintended permanent deletion

---

# Exit Rule

When all sections are complete:

1. Update CAPABILITIES.md
2. Declare worker system and delete functionality production-ready
3. Archive this file
4. Create new NEXT.md for next development phase

System must remain:

- Deterministic
- Local-first
- Explicit
- Observable
- Reliable

---
