# Phase 0 – Milestones Plan

## Overview

Phase 0 establishes the foundation of the application.
The focus is on safely ingesting images, storing them under app control, extracting basic metadata, and persisting everything reliably.

This phase prioritizes correctness, stability, and clarity over intelligence or performance optimizations.

---

## Milestone 0.1 – Image Intake

### Goal

Enable the application to accept image files from the user.

### Description

This milestone introduces the entry point for all images. The system should allow users to select image files and validate them before any further processing.

### Included

- Selecting one or more image files
- Basic validation to ensure selected files are images
- Clear handling of invalid or unsupported files

### Excluded

- File copying
- Storage
- Metadata extraction
- Persistence

### Completion Checklist

- [x] User can select image files
- [x] Non-image files are rejected gracefully
- [x] Invalid inputs do not crash the app

---

## Milestone 0.2 – App-Owned Image Copy

### Goal

Ensure the application can safely copy images into its own storage.

### Description

Once images are accepted, the app creates its own internal copies. The original files must remain untouched.

### Included

- Copying image files into app-managed storage
- Assigning a unique internal identity to each image
- Ensuring copied files are complete and valid

### Excluded

- Metadata extraction
- Database persistence
- Duplicate handling

### Completion Checklist

- [x] Images are copied into app storage
- [x] Original files remain unchanged
- [x] Copied images persist after app restart

---

## Milestone 0.3 – Image Storage Stability

### Goal

Verify that stored images are stable and retrievable over time.

### Description

This milestone validates that the app can reliably manage stored images and treat its storage as the source of truth.

### Included

- Consistent internal storage structure
- Ability to locate all stored images
- No partial or orphaned image files

### Excluded

- Metadata
- Thumbnails
- UI previews

### Completion Checklist

- [x] App can enumerate all stored images
- [x] No broken or missing image files
- [x] Restarting the app preserves all stored images

---

## Milestone 0.4 – Metadata Extraction

### Goal

Extract basic metadata from each stored image.

### Description

After images are stored, the application extracts essential metadata required for building a usable image library.

### Metadata Collected

- Original file name
- File size
- Image width
- Image height
- File type / extension
- Import timestamp

### Excluded

- EXIF parsing
- Hashing
- Visual or similarity analysis

### Completion Checklist

- [ ] Metadata is extracted for every stored image
- [ ] Width and height are accurate
- [ ] File size and type match the actual image

---

## Milestone 0.5 – Metadata Persistence

### Goal

Persist image metadata so the library survives restarts.

### Description

This milestone ensures that metadata is stored reliably and always remains consistent with stored images.

### Rules

- No image exists without metadata
- No metadata exists without an image
- Partial imports are not allowed

### Completion Checklist

- [ ] Metadata persists across app restarts
- [ ] Metadata accurately references stored images
- [ ] Removing an image also removes its metadata

---

## Milestone 0.6 – End-to-End Import Validation

### Goal

Validate the complete Phase 0 pipeline under real usage.

### Description

This milestone confirms that uploading, copying, storing, metadata extraction, and persistence work together as a single reliable flow.

### Included

- Importing multiple images in sequence
- Graceful handling of failures
- Clean recovery from partial errors

### Excluded

- Performance tuning
- Background processing
- Advanced UI features

### Completion Checklist

- [x] Multiple images import successfully end-to-end
- [x] Errors do not corrupt storage or metadata
- [x] App behaves predictably after restart
- [x] No orphaned files or records exist

---

## Phase 0 Exit Criteria

Phase 0 is complete when:

- Images can be uploaded and ingested reliably
- All images are owned and managed by the app
- Metadata is accurate and persistent
- The system is stable across restarts and failures

Once these criteria are met, the project is ready to move into Phase 1.
