# PROJECT_CONTEXT.md

## Clarity

Clarity is a **local-first image management application**.

The app allows users to import images from their filesystem, stores those images in app-managed storage, and maintains a database record for each imported image. Once imported, images are fully owned by the application and no longer depend on their original file locations.

Users can import images by selecting files or directories. Imported images are stored in a structured internal layout and can be retrieved and displayed in batches through the UI.

Exact duplicate files are detected during import to avoid ambiguous state. Import operations provide clear feedback about what was scanned, imported, skipped, or failed.

---

## Direction

Clarity is intended to grow into a **robust image resource management tool**.

The long-term focus is on:

- Safely handling large image collections
- Maintaining clear relationships between files and metadata
- Making destructive operations explicit and predictable
- Preserving user trust through transparency and data integrity

The project favors correctness, safety, and clarity over automation or novelty.

---

## Core Principles

- **Local-first**  
  All data stays on the user’s machine. No cloud dependency.

- **App-owned storage**  
  Imported images are copied into app-managed storage. Original user files are never modified.

- **Data integrity**  
  Filesystem state and database state must remain consistent. Failed operations must not leave partial or corrupted state.

- **Safety first**  
  Destructive actions should be explicit and deliberate.

- **Clear boundaries**  
  Core logic should not be tightly coupled to UI or framework code.

---

## Non-goals

Clarity is not intended to be:

- A cloud photo service
- A social or sharing platform
- An AI-first or ML-driven product
- A tool that edits or mutates original image files

---

## Notes

This document describes what the project **is**, not how complete or polished it is.  
Features and implementation details will evolve, but these principles should remain stable.

If another document conflicts with this one, this document takes priority.
