import streamlit as st


def init():
    """Initialize all session state variables."""
    if "selected_files" not in st.session_state:
        st.session_state["selected_files"] = set()
    if "deleted_files" not in st.session_state:
        st.session_state["deleted_files"] = set()
    if "hashes" not in st.session_state:
        st.session_state["hashes"] = {}


def toggle_selection(file_path):
    """Callback: Toggles a file's selection state."""
    if file_path in st.session_state["selected_files"]:
        st.session_state["selected_files"].remove(file_path)
    else:
        st.session_state["selected_files"].add(file_path)


def mark_as_deleted(file_list):
    """Moves files from 'selected' to 'deleted' history."""
    for f in file_list:
        st.session_state["deleted_files"].add(f)
        # Remove from selection so it doesn't count towards the counter anymore
        if f in st.session_state["selected_files"]:
            st.session_state["selected_files"].remove(f)


def get_selection_count():
    return len(st.session_state["selected_files"])


def is_selected(file_path):
    return file_path in st.session_state["selected_files"]


def reset_all():
    """Full Reset."""
    st.session_state["selected_files"] = set()
    st.session_state["deleted_files"] = set()
    # We keep hashes to avoid re-scanning, unless forced elsewhere
