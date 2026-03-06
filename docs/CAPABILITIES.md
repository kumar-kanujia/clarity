# CAPABILITIES.md

## Core Architecture

- **Design Principles:** The application operates as a local-first, deterministic system where the database acts as the single source of truth.
- **Non-Destructive Execution:** Original image files on the disk are never modified, relocated, or physically deleted by the application.
- **Event-Driven Processing:** Background processing operates strictly on an event-driven basis (no polling), ensuring worker isolation and crash safety without blocking user operations.

## Implemented Capabilities

### Discovery & Import

- Recursively scans selected folders for supported image formats (`jpg`, `jpeg`, `png`, `webp`, `bmp`, `gif`, `heic`).
- Extracts and persists metadata, including file path, size, and timestamps.
- Generates deterministic import summaries detailing scanned, imported, skipped, and failed files.

### Content Processing

- Computes BLAKE3 hashes via streaming read to establish exact file identity without excessive memory usage.
- Automatically triggers 256px `.webp` thumbnail generation after hashing completes.
- Transitions processing states explicitly through a `Pending → Hashed → Thumbnailed` pipeline.

### Organization & Tagging

- Allows users to create custom tags defined by a normalized name and hex color.
- Enforces strict referential integrity for tag assignments, allowing for soft deletion, permanent deletion, and restoration of tags.
- Supports marking individual images as favorites, which is immediately persisted to the database.

### Navigation & Gallery Views

- Utilizes cursor-based (keyset) pagination across all views to guarantee deterministic ordering and efficient loading of large datasets.
- **Gallery:** Displays all active images.
- **Favorites:** Displays favorited active images.
- **Tag Gallery:** Displays active images filtered by a specific tag.
- **Untagged Gallery:** Displays images with zero tag assignments, featuring dedicated empty-state messaging.
- **Trash:** Displays soft-deleted images safely isolated from the main library.

### Bulk Operations & Multi-Selection

- Supports multi-selection UI for executing batch actions cleanly.
- Executes bulk operations (soft delete, restore, permanent delete, tag attach, tag removal) within single database transactions to prevent partial state changes.
- Safely cleans up thumbnail cache files only after successful database deletion records are confirmed.

### Observability & UI Polish

- Maps all system failures to an explicit error taxonomy (`AppError`, `DatabaseError`, etc.) without leaking raw image data or sensitive OS paths to the frontend.
- Outputs structured tracing logs detailing inputs, execution time, and result states for full operational observability.
- Features a refined UI with standardized typography, smooth component interactions, clear selection states, and unobtrusive loading indicators.

## Capability Promotion Rule

Capabilities are added to this document only when they are fully implemented.
