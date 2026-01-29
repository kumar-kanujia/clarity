import subprocess
import sys

import streamlit as st
from PIL import Image, ImageOps

from modules import state


# --- CSS for Perfect Alignment ---
def inject_custom_css():
    st.markdown(
        """
        <style>
        /* Force images to fill their container */
        div[data-testid="stImage"] img {
            object-fit: cover;
            height: 200px; /* Fixed height for all images */
            width: 100%;
        }
        /* Style the 'Deleted' card */
        .deleted-card {
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f0f2f6;
            border: 1px dashed #bdc3c7;
            border-radius: 8px;
            color: #95a5a6;
            font-weight: bold;
        }
        </style>
    """,
        unsafe_allow_html=True,
    )


# --- Image Processor ---
def load_square_image(image_path, size=(300, 300)):
    try:
        img = Image.open(image_path)
        img = ImageOps.fit(img, size, Image.Resampling.LANCZOS)
        return img
    except:
        return None


# --- Folder Picker ---
def select_folder_dialog():
    if sys.platform != "darwin":
        return None
    script = """
    try
        tell application "System Events"
            activate
            set myFolder to choose folder with prompt "Select Image Folder"
            return POSIX path of myFolder
        end tell
    on error errMsg
        return "ERROR:" & errMsg
    end try
    """
    try:
        result = subprocess.run(
            ["osascript", "-e", script], capture_output=True, text=True
        )
        out = result.stdout.strip()
        return None if "ERROR:" in out else out
    except:
        return None


# --- Sidebar ---
def render_sidebar():
    with st.sidebar:
        st.header("✨ Clarity Settings")

        # Folder Input
        if "folder_path" not in st.session_state:
            st.session_state["folder_path"] = ""

        col1, col2 = st.columns([4, 1])
        with col1:
            st.session_state["folder_path"] = st.text_input(
                "Path",
                value=st.session_state["folder_path"],
                label_visibility="collapsed",
            )
        with col2:
            if st.button("📂"):
                path = select_folder_dialog()
                if path:
                    st.session_state["folder_path"] = path
                    st.rerun()

        threshold = st.slider("Sensitivity", 0, 20, 5)

        # Main Actions
        st.divider()
        col_scan, col_reset = st.columns([2, 1])
        with col_scan:
            scan = st.button("🔍 Scan", type="primary", use_container_width=True)
        with col_reset:
            reset = st.button("🔄", help="Reset All")

        # Live Stats
        st.divider()
        count = state.get_selection_count()
        if count > 0:
            st.metric("Selected to Trash", count)

        return st.session_state["folder_path"], threshold, scan, reset


# --- The Grid Renderer ---
def render_group(index, group_files, best_image):
    # Filter out files that are already deleted
    # We still want to show a placeholder for them

    st.markdown(f"**Group {index}**")
    cols = st.columns(4)

    for idx, file_path in enumerate(group_files):
        col_idx = idx % 4
        with cols[col_idx]:
            # CASE A: File was deleted in a previous batch
            if file_path in st.session_state["deleted_files"]:
                st.markdown(
                    '<div class="deleted-card">Deleted</div>', unsafe_allow_html=True
                )
                continue

            # CASE B: Active File
            img = load_square_image(file_path)
            if img:
                st.image(img, use_container_width=True)

                # Metadata / Best Badge
                is_best = file_path == best_image
                if is_best:
                    st.caption("⭐ Best Quality")
                else:
                    st.caption("Duplicate")

                # The "Live" Checkbox
                # We use the on_change callback to update the counter instantly
                is_checked = state.is_selected(file_path)
                st.checkbox(
                    "Delete",
                    value=is_checked,
                    key=f"chk_{file_path}",
                    on_change=state.toggle_selection,
                    args=(file_path,),
                )
    st.divider()
