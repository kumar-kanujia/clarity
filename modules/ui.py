import os
import subprocess
import sys

import streamlit as st
from PIL import Image

from modules import scanner  # Import scanner to get file info


def select_folder_dialog():
    """
    Robust macOS folder picker with error reporting.
    """
    if sys.platform != "darwin":
        st.error("This feature is Mac-only.")
        return None

    # The script:
    # 1. 'activate' forces the dialog to the front
    # 2. We ask 'System Events' (standard macOS helper) to show the dialog
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
        # Run the script
        result = subprocess.run(
            ["osascript", "-e", script], capture_output=True, text=True
        )

        output = result.stdout.strip()

        # Debugging: Print to terminal so you can see what's happening
        print(f"AppleScript Output: {output}")

        if "ERROR:" in output:
            # User hit Cancel or Permission Denied
            if "User canceled" not in output:
                st.error(f"macOS Error: {output}")
            return None

        return output

    except Exception as e:
        st.error(f"Python Error: {e}")
        return None


def render_sidebar():
    with st.sidebar:
        st.header("Settings")

        # 1. Folder Selection (Two options: Browse or Type)
        col1, col2 = st.columns([3, 1])
        with col1:
            # We use session state to persist the folder path
            if "folder_path" not in st.session_state:
                st.session_state["folder_path"] = ""

            st.text_input(
                "Path",
                value=st.session_state["folder_path"],
                label_visibility="collapsed",
            )

        with col2:
            if st.button("📂"):
                selected = select_folder_dialog()
                if selected:
                    st.session_state["folder_path"] = selected
                    st.rerun()  # Refresh to show the new path

        # 2. Reactive Slider (No form wrapping ensures instant update)
        threshold = st.slider("Similarity Threshold", 0, 20, 5)

        auto_select = st.checkbox("Auto-Select Lower Quality", value=True)

        # Button to start the HASHING process (expensive)
        scan_btn = st.button("Start Scan", type="primary")

        return st.session_state["folder_path"], threshold, auto_select, scan_btn


def render_group(index, group_files, best_image, auto_select_enabled):
    st.markdown(f"#### Group {index}")

    # Dynamic columns based on group size
    cols = st.columns(min(len(group_files), 4))
    selected_files = []

    for idx, file_path in enumerate(group_files):
        col_idx = idx % 4

        # Get Metadata
        size_str, dims, raw_size = scanner.get_file_info(file_path)
        is_best = file_path == best_image

        with cols[col_idx]:
            # Visual Container
            container = st.container(border=True)
            with container:
                # 3. Best Image Indicator
                if is_best:
                    st.markdown("⭐ **Best Quality**")

                try:
                    img = Image.open(file_path)
                    img.thumbnail((250, 250))
                    st.image(img, use_container_width=True)
                except Exception as e:
                    print(f"Exception Occured! {e}")
                    st.error("Img Error")

                # 3. Metadata Display
                st.caption(f"📏 {dims} | 💾 {size_str}")
                st.caption(f"📄 ...{os.path.basename(file_path)[-15:]}")

                # Logic for Auto-Selection
                # If auto-select is ON: Select everything EXCEPT the best image
                should_check = False
                if auto_select_enabled and not is_best:
                    should_check = True

                # The Checkbox
                if st.checkbox("Delete", key=file_path, value=should_check):
                    selected_files.append(file_path)

    st.divider()
    return selected_files
