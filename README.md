# Clarity

**Clarity** is a lightweight desktop image application built with **Tauri** and **React**.
Its primary goal is to help users **identify duplicate images** on their system and manage image clutter efficiently.

---

## ✨ Features

- 🔍 **Duplicate Image Detection**
  - Scan directories to find duplicate images
  - Designed to be fast and memory-efficient

- 🖼️ **Image Preview**
  - View detected duplicates directly in the app

- ⚡ **Native Performance**
  - Powered by Tauri (Rust backend + React frontend)

---

## 🧰 Tech Stack

- **Frontend**: React
- **Backend**: Tauri
- **Build Tool**: Vite + Cargo
- **Language**: TypeScript + Rust

---

## 📦 Prerequisites

Make sure the following are installed:

- **Bun**

  ```bash
  curl -fsSL https://bun.com/install | bash
  ```

- **Rust**

  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```

- **MacOS Build Tools**

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

---

### Install Dependencies

```bash
bun install
```

---

## 🚀 Development

Run the app in development mode:

```bash
bun tauri dev
```

This will:

- Start the React dev server
- Launch the Tauri desktop application with hot reload

---

## 🏗️ Build

To create a production build of the app ( for mac ):

```bash
bun tauri build --bundles dmg
```

After building, the generated binaries and installers can be found in:

```
src-tauri/target/release/
```

The output format depends on your operating system (e.g. `.exe`, `.dmg`, `.AppImage`).

---

## 🛣️ Roadmap

- Improved duplicate detection (perceptual hashing)
- Bulk image actions (delete / move)
- Folder exclusions
- Performance optimizations
- UI/UX improvements

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

---
