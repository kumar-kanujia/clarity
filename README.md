# Clarity

**Clarity** is a lightweight desktop image management application built with **Tauri** and **React**.
Its primary goal is to help users organize, browse, and deduplicate images on their system — fast and without moving a single file.

---

## ✨ Features

- 🔍 **Image Import & Discovery**
  - Scan files and directories recursively
  - Supported formats: JPG, JPEG, PNG, WebP, BMP, GIF, HEIC

- 🖼️ **Gallery Views**
  - Main gallery, Favorites, Bin (soft-deleted), and Tag-filtered views
  - Cursor-based pagination for large collections

- 🏷️ **Tagging & Organization**
  - Create, edit, and soft-delete custom tags (name + color)
  - Toggle tags on/off per image
  - Browse images filtered by tag

- ⭐ **Favorites**
  - Mark/unmark any image as a favorite
  - Dedicated Favorites view

- 🗑️ **Soft Delete (Bin)**
  - Move images to Bin without touching files on disk
  - Restore from Bin at any time

- 🔑 **Content Hashing**
  - Blake3 hash computed per file via background worker
  - Lays the groundwork for duplicate detection

- 🖼️ **Thumbnail Generation**
  - 256px WebP thumbnails generated in the background after hashing
  - Cached locally; generation never blocks the UI

- ⚡ **Native Performance**
  - Powered by Tauri (Rust backend + React frontend)
  - Rayon-parallel processing for hashing and thumbnail generation
  - SQLite database with WAL mode and memory-mapped IO

---

## 🧰 Tech Stack

| Layer    | Technology                           |
| -------- | ------------------------------------ |
| Frontend | React + TypeScript + TanStack Router |
| Backend  | Tauri v2 (Rust)                      |
| Database | SQLite via `sqlx`                    |
| Build    | Vite + Cargo                         |
| Styling  | (CSS / component library)            |

**Key Rust crates:** `tauri`, `sqlx`, `tokio`, `rayon`, `image` (image-rs), `blake3`, `walkdir`, `tracing`

---

## 📦 Prerequisites

Make sure the following are installed:

- **pnpm**

  ```bash
  curl -fsSL https://get.pnpm.io/install.sh | sh -
  ```

- **Rust**

  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```

- **macOS Build Tools**

  ```bash
  xcode-select --install
  ```

---

## 📥 Getting Started

### Clone the Repository

```bash
git clone https://github.com/kumar-kanujia/clarity
cd clarity
```

### Install Dependencies

```bash
pnpm install
```

---

## 🚀 Development

Run the app in development mode:

```bash
pnpm tauri dev
```

This will:

- Start the React dev server (Vite)
- Launch the Tauri desktop application with hot reload

---

## 🏗️ Build

To create a production build (macOS):

```bash
pnpm tauri build --bundles dmg
```

Generated binaries and installers are placed in:

```
src-tauri/target/release/
```

---

## 🛣️ Roadmap

- [ ] Duplicate detection UI (BLAKE3 hashes are already computed)
- [ ] Batch image actions (bulk delete / bulk tag)
- [ ] Folder exclusions during import
- [ ] Physical file deletion from Bin
- [ ] Advanced search & filtering

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Open a pull request

---

## 📄 License

MIT License
