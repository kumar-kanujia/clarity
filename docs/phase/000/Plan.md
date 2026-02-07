# Phase 0 – Image Ingestion & Metadata Foundation

## Objective

Phase 0 focuses on building a reliable foundation for the application.
The goal is to allow users to bring images into the app, store them safely under app control, extract essential metadata, and persist that information for future use.

This phase intentionally avoids any “smart” features and prioritizes correctness, stability, and clarity.

---

## Scope Summary

Phase 0 includes:

- Accepting images from users
- Copying images into app-managed storage
- Persisting stored images
- Extracting basic metadata
- Persisting metadata

---

## 1. Upload Image

### Description

The application allows users to upload image files into the system.  
This is the entry point for all future functionality.

### What this includes

- Selecting one or more image files
- Basic validation to ensure files are images
- Clear feedback if a file cannot be accepted

### What this does NOT include

- Folder watching or auto-import
- Advanced drag-and-drop interactions
- Cloud uploads or syncing

### Intent

This feature establishes how images enter the application in a controlled and predictable way.

---

## 2. Copy Image

### Description

Once an image is uploaded, the application creates its own internal copy of the file.

### What this includes

- Copying image data into app-controlled storage
- Ensuring the original file is never modified
- Assigning a unique internal identity to each image

### What this does NOT include

- Linking back to the original file location
- Maintaining original folder structure
- Any destructive operation on user files

### Intent

By owning the image files, the app avoids broken references and ensures long-term stability even if the user deletes or moves originals.

---

## 3. Store Image

### Description

Copied images are stored in a structured, app-managed storage area.

### What this includes

- A consistent internal storage location
- Guaranteed ability to locate images using app data
- Separation between original images and derived data (future-proofing)

### What this does NOT include

- User-facing file paths
- Manual file management by the user
- Optimization or compression

### Intent

This establishes the application as the single source of truth for all imported images.

---

## 4. Get Metadata

### Description

After an image is copied and stored, the application extracts basic metadata from the file.

### Metadata collected in Phase 0

- Original file name
- File size
- Image width
- Image height
- File type / extension
- Import timestamp

### What this does NOT include

- EXIF parsing
- Camera or location data
- Visual analysis or hashing

### Intent

Metadata provides the minimum information required to build a usable library and support future features like sorting, grouping, and previews.

---

## 5. Store Metadata

### Description

All extracted metadata is persisted in the application’s internal database.

### What this includes

- One metadata record per imported image
- Guaranteed consistency between stored images and metadata
- Metadata persistence across app restarts

### Rules

- No image exists without metadata
- No metadata exists without a stored image
- Partial imports are not allowed

### Intent

This creates a reliable index of all images and ensures the library can be reconstructed at any time.

---

## Completion Checklist

### Upload Image

- [ ] User can select one or more image files
- [ ] Non-image files are rejected gracefully
- [ ] Upload failures are clearly reported

### Copy Image

- [ ] Images are copied into app-controlled storage
- [ ] Original files remain untouched
- [ ] Each image receives a unique internal identity

### Store Image

- [ ] Images are persistently stored
- [ ] Stored images are accessible after app restart
- [ ] No orphaned or partial files exist

### Get Metadata

- [ ] Metadata is extracted for every imported image
- [ ] Width and height match the actual image
- [ ] File size and type are accurate

### Store Metadata

- [ ] Metadata is persisted reliably
- [ ] Metadata matches stored images
- [ ] App restart does not lose library state

---

## Phase 0 Definition of Done

Phase 0 is complete when:

- Images can be uploaded and imported end-to-end
- Images are fully owned and managed by the app
- Metadata is accurate and persistent
- The system behaves predictably across restarts

Once these conditions are met, the project is ready to move into Phase 1.
