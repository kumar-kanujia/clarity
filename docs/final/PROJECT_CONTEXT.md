# PROJECT_CONTEXT.md

## Clarity

Clarity is a **local-first image management application**.

The app lets users import images from their filesystem, stores those images in app-managed storage, and keeps a database record for each imported file. Once an image is imported, the app does not rely on the original file location.

At the moment, the functionality is basic:

- Directories can be selected and scanned
- Images are copied into app data
- A database entry is created per image
- Imported images can be listed and shown in the UI

There is also an older, experimental section that attempts duplicate detection and allows sending selected files to trash. This part is not optimized and should not be treated as stable.

---

## Direction

Over time, Clarity is intended to become a **robust image resource management tool**, not just an image viewer. The focus is on safely handling large image collections and giving users clear control over their data.

Features will be added gradually, but the emphasis is on correctness and safety rather than speed or novelty.

---

## Core Principles

- **Local-first**
  All data stays on the user’s machine. No cloud dependency.

- **App-owned storage**
  Imported images are copied into app-managed storage. Original files are never modified.

- **Data integrity**
  Filesystem state and database state must stay in sync. Failed operations should not leave partial data behind.

- **Safety first**
  Destructive actions should be explicit and, where possible, reversible.

- **Clear boundaries**
  Core logic should not be tightly coupled to UI or framework code.

---

## Non-goals (Maybe)

Clarity is not intended to be:

- A cloud photo service
- A social or sharing platform
- An AI-first or ML-driven product
- A tool that edits or mutates original image files

---

## Notes

This document describes **what the project is**, not how complete or polished it currently is. Implementation quality and features will evolve, but these principles should remain stable.

If other documents conflict with this one, this document takes priority.

---
