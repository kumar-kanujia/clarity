# Clarity Architecture Reference (Phase 1.1)

## 1. Core Philosophy: The Clean Architecture

Clarity uses a **Clean Architecture** approach. This means the application is divided into concentric layers, with dependencies flowing **inwards**.

- **Rule 1: Dependency Rule.** Source code dependencies can only point inwards. Nothing in an inner circle can know anything at all about something in an outer circle.
- **Rule 2: Framework Independence.** The architecture does not depend on the existence of some library of feature laden software. This allows you to use such frameworks as tools, rather than having to cram your system into their limited constraints.
- **Rule 3: Testable.** The business rules can be tested without the UI, Database, Web Server, or any other external element.

## 2. Directory Structure

This structure ensures separation of concerns and prepares the app for complex features like deduplication and tagging.

```text
src/
├── domain/                  # THE CORE (Pure Rust, No IO)
│   ├── mod.rs
│   ├── image.rs             # Image entity & metadata logic
│   ├── tag.rs               # Tag entity definitions
│   └── rules.rs             # Core logic (e.g., hash comparison thresholds)
│
├── application/             # THE ORCHESTRATOR (Use Cases)
│   ├── mod.rs
│   ├── importer.rs          # Pipeline: Scan -> Hash -> Thumbnail -> Save
│   ├── library.rs           # Gallery browsing, Sorting, & Traversal logic
│   ├── maintenance.rs       # Deduplication workflows & Safety checks
│   └── tagging.rs           # Tag management services
│
├── infrastructure/          # THE TOOLS (IO, DB, FS, External Libs)
│   ├── mod.rs
│   ├── repo/                # Database interactions
│   │   ├── image_repo.rs    # SQL for Images
│   │   └── tag_repo.rs      # SQL for Tags & Relations
│   ├── fs/                  # File System interactions
│   │   ├── scanner.rs       # Directory walking
│   │   ├── ops.rs           # Safe Delete, Copy, Move
│   │   └── local.rs         # Path management (App Data vs. External)
│   └── media/               # Heavy Lifting
│       ├── processing.rs    # Thumbnail generation & Resizing
│       └── hashing.rs       # Perceptual hash calculation
│
├── interface/               # THE GATEWAY (Tauri)
│   ├── mod.rs
│   ├── commands.rs          # Exposes Application logic to Frontend
│   └── dtos.rs              # Data Transfer Objects (Frontend JSON shapes)
│
├── lib.rs                   # Library root
└── main.rs                  # Application entry & Dependency wiring
```

---

## 3. Layer Responsibilities & Decision Log

### **A. Domain Layer (`src/domain/`)**

- **Role:** Defines _what_ the application is.
- **Rules:** Pure Rust. **Zero** dependencies on `sqlx`, `tauri`, or `std::fs`.
- **Why for Clarity:**
- **Deduplication:** Defines the "Same Image" rule (e.g., `hamming_distance < 5`). This logic is critical and must be tested in isolation from the database.
- **Tags:** Defines the `Tag` struct.

### **B. Application Layer (`src/application/`)**

- **Role:** Coordinates the work. It tells the Infrastructure _what_ to do.
- **Rules:** Contains business logic flows. Knows about Domain and Infrastructure interfaces.
- **Why for Clarity:**
- **Import Pipeline:** The `importer.rs` service centralizes the complex chain: _Scan Folder -> Calculate Hash -> Generate Thumbnail -> Save to DB_. This prevents partial imports and keeps the UI responsive.
- **Traversal:** `library.rs` handles the logic for "Next Image" and "Previous Image" based on the user's current sort order and active filters.
- **Deletion Safety:** `maintenance.rs` decides _if_ a file can be deleted (e.g., "Is it external? If so, warn user first").

### **C. Infrastructure Layer (`src/infrastructure/`)**

- **Role:** The implementation details. Handles dirty work like Disk IO and SQL.
- **Rules:** The only layer allowed to touch the database, file system, or external image libraries.
- **Why for Clarity:**
- **Thumbnails:** `media/processing.rs` isolates the heavy `image-rs` library. If you switch to a faster thumbnailer later (e.g., `ffmpeg`), you only change this file.
- **In-Place Deletion:** `fs/ops.rs` contains specific, safe functions for `delete_internal_file` or `delete_external_file`.
- **Persistence:** `repo/` manages SQL queries. It handles pagination for the Gallery so loading 50,000 images doesn't freeze the app.

### **D. Interface Layer (`src/interface/`)**

- **Role:** The "Front Desk". Receives requests from Tauri/JS and hands them to the Application layer.
- **Rules:** Thin wrappers only. No business logic allowed.
- **Why for Clarity:**
- **Stability:** If you change how the database works, you don't need to rewrite your Tauri commands, because the Interface layer is decoupled from the Infrastructure.

---

## 4. Feature Implementation Strategy (Phase 1)

This mapping shows exactly where code for your roadmap items will live.

## Feature Overview

| Feature          | Logic Location                                                                | Implementation Detail                                                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Image Gallery    | `application/library.rs`                                                      | Fetches paginated lists from the database. Handles sorting and filtering logic.                                                                       |
| Traversal        | `application/library.rs`                                                      | Implements **Next / Prev** navigation. Calculates the next image ID based on the current sort order.                                                  |
| Thumbnails       | `infrastructure/media/processing.rs`                                          | Triggered during import. Stores the thumbnail path in the database. The application layer decides when to generate thumbnails (e.g., lazy vs. eager). |
| Duplicate Detect | `domain/rules.rs` (logic) <br>`infrastructure/media/hashing.rs` (calculation) | Hash is calculated on import. `maintenance.rs` runs queries to detect hash collisions.                                                                |
| In-Place Delete  | `infrastructure/fs/ops.rs`                                                    | Provides distinct functions: `delete_internal_file()` and `delete_external_file()`.                                                                   |
| Tagging          | `application/tagging.rs`                                                      | Manages the many-to-many relationship logic for adding tags to images.                                                                                |

---

## 5. Testing Strategy

The architecture supports the **Testing Pyramid**, prioritizing fast unit tests over slow end-to-end tests.

- **Unit Tests (`domain/`, `application/`):** Test logic (e.g., "Does `1024 bytes` format to `1 KB`?"). Fast, no IO.
- **Integration Tests (`tests/`):** Test the flow (e.g., "Does `import_directory` call `save_image`?"). Use mocks for FS/DB.
- **Infrastructure Tests (`infrastructure/`):** Test the metal (e.g., "Does this SQL query actually insert a row?"). Slow, requires setup.
- **End-to-End Tests (`e2e/`):** Test the whole app (e.g., "Does the Gallery load 50 images?").
