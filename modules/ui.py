import os

import streamlit as st
from PIL import Image


def render_sidebar():
    """Renders the sidebar and returns the settings."""
    with st.sidebar:
        st.header("Settings")
        folder_path = st.text_input("Folder Path", help="Absolute path to your images")

        threshold = st.slider(
            "Similarity Threshold", 0, 20, 5, help="0=Exact, 10=Loose"
        )

        run_btn = st.button("Scan Images")
        return folder_path, threshold, run_btn


def render_group(index, group_files):
    """Renders a single group of similar images."""
    st.markdown(f"### Group {index}")
    cols = st.columns(min(len(group_files), 4))

    selected_for_delete = []

    for idx, file_path in enumerate(group_files):
        col_idx = idx % 4
        with cols[col_idx]:
            try:
                img = Image.open(file_path)
                img.thumbnail((200, 200))  # Thumbnails are faster
                st.image(img, use_container_width=True)
                st.caption(os.path.basename(file_path))

                # The Checkbox
                if st.checkbox("Delete", key=file_path):
                    selected_for_delete.append(file_path)
            except Exception:
                st.error("Error loading img")

    st.divider()
    return selected_for_delete
