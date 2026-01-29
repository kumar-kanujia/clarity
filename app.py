import streamlit as st

from modules import processor, scanner, state, ui

st.set_page_config(layout="wide", page_title="Clarity", page_icon="✨")
st.title("✨ Clarity: Visual Manager")

# 1. Initialize State
state.init()
ui.inject_custom_css()

# 2. Sidebar
folder_path, threshold, scan_btn, reset_btn = ui.render_sidebar()

# 3. Logic: Reset
if reset_btn:
    state.reset_all()
    if "hashes" in st.session_state:
        del st.session_state["hashes"]
    st.rerun()

# 4. Logic: Scan
if scan_btn and folder_path:
    st.session_state["scanning"] = True

    # Run Hash
    files = scanner.get_image_files(folder_path)
    with st.spinner("Analyzing images..."):
        st.session_state["hashes"] = processor.compute_hashes(files)

    # Auto-Selection Logic (Runs once per scan)
    # We calculate groups here to apply the auto-select logic to the STATE
    groups = processor.group_images(st.session_state["hashes"], threshold)

    for group in groups:
        best_img = processor.identify_best_image(group)
        for img in group:
            if img != best_img and img not in st.session_state["deleted_files"]:
                # Auto-add to selection
                st.session_state["selected_files"].add(img)

# 5. Main View
if st.session_state.get("scanning"):
    # Re-calculate groups (fast)
    groups = processor.group_images(st.session_state["hashes"], threshold)

    if not groups:
        st.info("No similar images found.")
    else:
        # Floating Action Button for Deletion
        # We place this at the top (or bottom) container
        count = state.get_selection_count()

        # Action Bar
        col1, col2 = st.columns([3, 1])
        with col1:
            st.subheader(f"Found {len(groups)} Groups")
        with col2:
            if count > 0:
                if st.button(f"🗑️ Trash ({count}) Images", type="primary"):
                    # Execute Delete
                    files_to_delete = list(st.session_state["selected_files"])
                    scanner.safe_delete(files_to_delete)

                    # Update State
                    state.mark_as_deleted(files_to_delete)
                    st.success("Files moved to trash.")
                    st.rerun()

        # Render Groups
        for i, group in enumerate(groups):
            best = processor.identify_best_image(group)
            ui.render_group(i + 1, group, best)
