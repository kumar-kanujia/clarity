# ✨ Clarity

![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)
![PyQt6](https://img.shields.io/badge/GUI-PyQt6-green?logo=qt)
![Build](https://img.shields.io/github/actions/workflow/status/yourusername/clarity/build.yml)

**Clarity** is a native macOS application designed to organize and declutter large photo collections.

Unlike standard duplicate finders, Clarity uses **Perceptual Hashing (pHash)** to group images that _look_ similar (burst shots, edits, resized copies). It features a native high-performance grid, background scanning, and smart quality detection.

## 🚀 Features

- **Native Performance:** Built with PyQt6 for smooth scrolling of thousands of images.
- **Visual Grouping:** Groups images by visual composition, not just filename.
- **Smart Select:** Automatically identifies the "Best" image (highest resolution/size) in a group.
- **Non-Destructive:** Moves files to the macOS Trash (Bin) so you can recover mistakes.
- **Adjustable Sensitivity:** Slider to control how strict the similarity search is.

## 🛠️ Development Setup

Clarity uses [uv](https://github.com/astral-sh/uv) for fast, modern dependency management.

### Prerequisites

- Python 3.12+
- `uv` installed

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/kumar-kanujia/clarity
    cd clarity
    git checkout poc
    ```

2.  **Install dependencies:**

    ```bash
    uv sync
    ```

3.  **Run the App:**
    ```bash
    uv run python main.py
    ```

## 📦 Building the App (Locally)

To create a standalone `.app` file on your machine:

```bash
uv run pyinstaller --name Clarity --windowed --clean --noconfirm main.py
```
