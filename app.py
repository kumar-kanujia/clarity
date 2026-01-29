import os

import streamlit as st

# Import our new modules
from modules import processor, scanner, ui

st.set_page_config(layout="wide", page_title="Clarity", page_icon="✨")
st.title("✨ Clarity: Visual Image Manager")

# 1. Setup UI & Get Inputs
folder_path, threshold, run_btn = ui.render_sidebar()

# 2. Session State Management
if run_btn:
    if folder_path and os.path.exists(folder_path):
        st.session_state["scanning"] = True
        st.session_state["folder"] = folder_path
        # Clear old hashes if scanning a new folder
        if "hashes" in st.session_state:
            del st.session_state["hashes"]
    else:
        st.error("Please enter a valid folder path.")

# 3. Main Application Logic
if st.session_state.get("scanning"):
    folder = st.session_state["folder"]

    # Step A: Find Files
    files = scanner.get_image_files(folder)
    st.write(f"📂 Found {len(files)} images.")

    # Step B: Process (Hash)
    # Note: Streamlit caches this automatically inside the processor module
    if "hashes" not in st.session_state:
        st.session_state["hashes"] = processor.compute_hashes(files)

    # Step C: Group
    groups = processor.group_images(st.session_state["hashes"], threshold)

    if not groups:
        st.info("No similar images found.")
    else:
        st.success(f"Found {len(groups)} groups.")

        # Step D: Render Results
        with st.form("deletion_form"):
            all_files_to_delete = []

            # Loop through groups and render them
            for i, group in enumerate(groups):
                # UI module handles the drawing
                to_delete = ui.render_group(i + 1, group)
                all_files_to_delete.extend(to_delete)

            # Step E: Handle Deletion
            if st.form_submit_button("Trash Selected"):
                count, errors = scanner.safe_delete(all_files_to_delete)

                if count > 0:
                    st.success(f"Moved {count} images to Trash.")
                    # Clear cache to force refresh
                    del st.session_state["hashes"]
                    st.rerun()

                if errors:
                    st.error(f"Errors: {errors}")
