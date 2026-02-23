---

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

- [ ] Define worker event system
- [ ] Define event types for pipeline stages
- [ ] Ensure workers sleep when no work exists
- [ ] Ensure workers wake immediately when work is available
- [ ] Remove loop-based polling logic

Completion Check:

- [ ] No continuous polling exists
- [ ] Workers activate only when events occur
- [ ] Worker behavior deterministic

---

## Part 1.2 — Pipeline Event Integration

Events must be emitted when pipeline work becomes available.

- [ ] Emit event when image enters Pending state
- [ ] Emit event when hashing completes
- [ ] Emit event when thumbnail generation becomes available
- [ ] Ensure events emitted only after DB commit succeeds
- [ ] Ensure duplicate events do not cause duplicate processing

Completion Check:

- [ ] All pipeline stages triggered by events
- [ ] No missed processing
- [ ] No duplicate processing

---

## Part 1.3 — Worker Reliability and Safety

- [ ] Ensure worker crash isolation remains intact
- [ ] Ensure retry logic continues to function
- [ ] Ensure failed items do not block worker
- [ ] Ensure worker restart resumes processing correctly

Completion Check:

- [ ] Worker system reliable and fault-tolerant
- [ ] Worker system fully event-driven

---

# SECTION 2 — Tag System Expansion

Goal: Complete tag delete, restore, and permanent delete functionality.

Soft delete already exists.

---

## Part 2.1 — Retrieve Deleted Tags

- [ ] Retrieve deleted tags
- [ ] Retrieve active tags only
- [ ] Retrieve all tags (active and deleted)
- [ ] Support sorting and pagination of deleted tags

Completion Check:

- [ ] Deleted tags fully observable

---

## Part 2.2 — Restore Deleted Tag

- [ ] Restore deleted tag
- [ ] Restore preserves tag ID
- [ ] Restore preserves tag assignments
- [ ] Restore fails safely if tag conflict exists

Completion Check:

- [ ] Tag restore reliable
- [ ] Tag relationships preserved

---

## Part 2.3 — Permanent Tag Delete

- [ ] Permanently delete tag record
- [ ] Remove all tag assignments
- [ ] Ensure referential integrity maintained
- [ ] Ensure no orphan tag references remain

Completion Check:

- [ ] Tag fully removed from system

---

# SECTION 3 — Permanent Image Delete

Goal: Support permanent removal of image records from system.

Permanent delete affects database and derived data only.
Original files on disk must not be deleted.

---

## Part 3.1 — Permanent Image Delete Operation

- [ ] Permanently delete image record
- [ ] Remove tag assignments
- [ ] Remove favorite state
- [ ] Remove pipeline state
- [ ] Remove duplicate relationships

Completion Check:

- [ ] Image fully removed from database
- [ ] No orphan references remain

---

## Part 3.2 — Thumbnail Cleanup

- [ ] Delete thumbnail cache for permanently deleted image
- [ ] Ensure no orphan thumbnail files remain

Completion Check:

- [ ] Thumbnail cache consistent with database

---

## Part 3.3 — Permanent Delete Safety

- [ ] Permanent delete requires explicit operation
- [ ] Permanent delete fully logged
- [ ] Permanent delete deterministic

Completion Check:

- [ ] No unintended permanent deletion

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
