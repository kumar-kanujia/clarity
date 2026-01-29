# ✨ Clarity

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=flat&logo=python)
![Streamlit](https://img.shields.io/badge/Streamlit-FF4B4B?style=flat&logo=streamlit)
![Status](https://img.shields.io/badge/Status-Active-success)

**Clarity** is an intelligent, modular image organization tool designed for macOS.

Unlike standard duplicate finders that only look for identical file sizes or names, Clarity uses **Perceptual Hashing (pHash)** to identify images that _look_ similar. This allows you to group burst photos, edited versions, and resized copies, helping you curate your best shots and clear the clutter.

## 🚀 Key Features

- **👁️ Visual Similarity Search:** Groups images by visual composition, not just metadata.
- **🧠 Smart Select:** Automatically identifies and preserves the highest quality (largest file size) image in a group, pre-selecting lower-quality versions for deletion.
- **🎛️ Adjustable Sensitivity:** Use the "Similarity Threshold" slider to toggle between finding exact duplicates or loosely similar shots.
- **🗑️ Mac-Safe Deletion:** Uses `send2trash` to move files to the System Trash. No accidental permanent data loss.
- **🧩 Modular Architecture:** Clean separation of concerns (UI, Logic, File Operations) for easy maintenance and scalability.

## 🛠️ Installation & Setup

Clarity is built with modern Python tooling using **uv**.

### Prerequisites

- Python 3.10 or higher
- [uv](https://github.com/astral-sh/uv) (Recommended for dependency management)

### Step-by-Step

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/kumar-kanujia/clarity
    cd clarity
    ```

2.  **Initialize environment & install dependencies:**
    ```bash
    uv init
    uv pip install streamlit imagehash pillow send2trash numpy
    ```

## 🖥️ Usage

1.  **Run the Application:**

    ```bash
    uv run streamlit run app.py
    ```

2.  **The Workflow:**
    - **Folder Path:** Paste the absolute path to your image directory (e.g., `/Users/name/Pictures/Trip`).
    - **Threshold:** \* `0`: Exact duplicates only.
      - `5`: Standard similarity (recommended).
      - `10+`: Group loosely related images.
    - **Scan:** Click "Scan Images".
    - **Review:** Browse the groups. The "Smart Select" feature will auto-check the boxes for images likely to be discarded.
    - **Trash:** Click "Trash Selected" to move them to the Mac Trash bin.

## 📂 Project Structure

Clarity follows a **Model-View-Controller (MVC)** inspired structure:

```text
clarity/
├── app.py              # Controller: Entry point and state management
├── modules/
│   ├── scanner.py      # File Ops: Directory scanning & safe deletion
│   ├── processor.py    # Model: Image hashing, caching, & logic
│   └── ui.py           # View: Sidebar & Image Grid rendering
├── .gitignore          # System & Python exclusions
└── README.md           # Documentation
```
