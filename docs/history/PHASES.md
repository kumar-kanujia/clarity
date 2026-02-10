# PHASES.md

## Phase 0 — Initial Implementation

**Goal**  
Get a basic end-to-end flow working for importing and persisting images.

**What was done**

- Ability to select one or more directories
- Scan directories for image files
- Copy selected images into app-managed storage
- Create a database entry for each imported image
- Retrieve stored images from the database
- Display imported images in the UI

**Notes**

- Focus was on making the full loop work, not on structure or robustness
- Error handling was minimal
- Performance and optimization were not a concern at this stage

**Exit state**

- A working but rough image import and display pipeline existed

---

## Phase 1 — Stabilization and Cleanup

**Goal**  
Make the existing functionality more reliable and easier to reason about, without adding major new features.

**What was done**

- Cleaned up and clarified the import flow
- Reduced coupling between UI, filesystem, and database logic
- Ensured imported images live only in app-managed storage
- Verified that images saved in the database can always be retrieved and shown in the UI
- Identified older / experimental code paths as non-stable

**Notes**

- No major new user-facing features were added
- Some areas (error handling, optimization) were intentionally deferred
- The focus was on preparing the system for deliberate extension

**Exit state**

- The core import → store → list → display flow was stable enough to build on

---

## Phase 2 — Import & Storage Scaling

**Goal**  
Make image import, storage, and retrieval reliable and scalable for real-world image libraries.

**What was done**

- Introduced stable internal image identifiers
- Moved to a deterministic, non-flat storage layout
- Unified import handling for:
  - Single files
  - Multiple files
  - Multiple directories
- Prevented duplicate scans for overlapping directories
- Added exact duplicate detection based on file content
- Ensured duplicate imports do not create ambiguous state
- Added import summaries (scanned, imported, skipped, failed)
- Implemented batch-based image retrieval with deterministic ordering
- Ensured image viewing relies only on internal IDs and app-managed storage

**Notes**

- Duplicate handling is exact (file-level), not similarity-based
- Some edge cases (e.g. partial failure recovery) are still explicitly deferred
- Focus remained on correctness and predictability over optimization

**Exit state**

- The app can safely ingest and browse large image collections
- Storage and retrieval behavior is predictable and transparent
- The system is usable without manual babysitting

---

## Phase 3 — Image Indexing & Metadata

**Goal**
Shift from app-managed file storage to a **reference-based, database-driven image model** in order to unlock feature development and reduce storage complexity.

---

**What was done**

- Implemented reference-based image import:
  - Users can select one or more image files
  - Files remain in their original locations
  - No copying, moving, or mutation of user files

- Registered imported images directly in the database

- Assigned a stable internal image ID to each image

- Ensured image identity survives restarts

- Allowed database records to exist even if files later become unavailable

- Implemented metadata extraction on import:
  - Image dimensions
  - File size
  - Image format
  - Import timestamp

- Ensured metadata extraction failures do not block import

- Established the database as the source of truth:
  - One database record per image ID
  - Metadata persists across restarts
  - Database updates never touch the filesystem
  - Metadata remains intact even if files move or disappear

- Removed legacy app-managed storage code safely

- Implemented retrieval and viewing:
  - Batch-based image retrieval from the database
  - Deterministic ordering
  - UI never requests the full dataset at once
  - Images load from original file paths
  - File availability is checked at view time
  - Missing or unreadable files fail explicitly without breaking browsing

---

**Notes**

- This phase intentionally removes file ownership from the application
- Image files are treated as external, read-only resources
- The database now represents the full application state
- Feature development is no longer blocked by storage concerns
- Phase 2 storage work informed this phase but is no longer active

---

**Exit state**

- Images can be imported by reference
- Metadata is extracted and persisted reliably
- The database fully represents image state
- Images can be retrieved and viewed at scale
- The app no longer manages or stores user image files

---
