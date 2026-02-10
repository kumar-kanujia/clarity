# PROJECT_CONTEXT.md

## Clarity

Clarity is a **local-first image indexing and viewing application**.

The app allows users to select files or folders from their filesystem, scans them recursively to discover image files, and stores image metadata in a local database. Image files remain in their original locations and are treated as external, read-only resources.

Clarity does not copy, move, or modify user files. The database acts as the authoritative source for image identity and metadata, while files are accessed only when needed for viewing.

---

## Direction

Clarity is intended to grow into a **reliable photo viewing and organization tool**, with a strong focus on transparency and predictability.

Near-term goals include:

- A fast and dependable photo viewing experience
- Explicit and trustworthy duplicate detection
- Simple, user-controlled tagging and organization

The project prioritizes **feature usefulness and correctness** over file ownership or automation.

---

## Core Principles

- **Local-first**
  All data stays on the user’s machine. No cloud dependency.

- **User-owned files**
  Image files remain fully owned and managed by the user.
  The application treats files as read-only references.

- **Database-driven state**
  The database represents the application’s state, including image identity and metadata.

- **Explicit behavior**
  The system does not guess, auto-repair, or silently mutate state.
  Missing or changed files are surfaced clearly.

- **Incremental evolution**
  Features are added in small, verifiable steps.
  Old code is removed as new capabilities replace it.

---

## Non-goals

Clarity is not intended to be:

- A cloud photo service
- A file backup or synchronization tool
- A fully automated or AI-driven system
- A destructive editor of original image files

---

## Notes

This document defines what the project **is**, not a complete feature list.
Capabilities will evolve incrementally, but these principles should remain stable.

---
