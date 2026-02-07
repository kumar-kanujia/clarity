# Project Context – Image Library Application

## Project Overview

This project is a local-first image management application inspired by tools like Eagle.

The application owns all imported images by copying them into app-managed storage.
Once imported, the app never depends on the original file locations.

The long-term goal is to support:

- Duplicate detection
- Similar image grouping
- Visual-based organization

However, the project is intentionally developed in strict phases.

---

## Current Phase

### Phase 0 – Image Ingestion & Metadata Foundation

Phase 0 is intentionally minimal and focuses on correctness and stability.

### Phase 0 Features (Locked)

- Upload image(s) from user
- Copy image into app-owned storage
- Store image persistently
- Extract basic metadata
- Store metadata persistently

### Explicitly Out of Scope for Phase 0

- Hashing
- Thumbnails
- Duplicate detection
- Similarity grouping
- ML or OpenCV
- Advanced UI features
- Background jobs

---

## Phase 0 Deliverables

By the end of Phase 0:

- The app fully owns all imported images
- Images persist across app restarts
- Metadata is accurate and consistent
- No orphaned files or records exist

---

## Existing Planning Documents

- `Plan.md` – High-level Phase 0 feature plan
- `Milestones.md` – Detailed milestone breakdown for Phase 0

These documents define scope and must be respected in future planning.

---

## Design Principles

- Local-first
- App-owned storage
- Correctness over intelligence
- Finish phases completely before moving on
- No scope creep within a phase

All future phases should build incrementally on this foundation.
