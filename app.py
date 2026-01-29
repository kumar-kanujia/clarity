import streamlit as st

from modules import processor, scanner, ui

st.set_page_config(layout="wide", page_title="Clarity", page_icon="✨")
st.title("✨ Clarity: Visual Manager")

# --- 1. Sidebar & Inputs ---
folder_path, threshold, auto_select, scan_btn = ui.render_sidebar()

# --- 2. State Management ---
if scan_btn and folder_path:
    st.session_state["scanning"] = True
    # Clear cache if new scan requested
    if "hashes" in st.session_state:
        del st.session_state["hashes"]

# --- 3. Main Logic ---
if st.session_state.get("scanning") and folder_path:
    # A. Discovery
    files = scanner.get_image_files(folder_path)

    if not files:
        st.warning("No images found in this folder.")
    else:
        # B. Hashing (Cached)
        if "hashes" not in st.session_state:
            with st.spinner(f"Analyzing {len(files)} images..."):
                st.session_state["hashes"] = processor.compute_hashes(files)

        # C. Grouping (Reactive!)
        # This runs every time the slider moves because it's not cached in session state
        groups = processor.group_images(st.session_state["hashes"], threshold)

        st.info(f"Found {len(groups)} groups of similar images.")

        # D. Rendering
        with st.form("bulk_delete_form"):
            all_marked_files = []

            for i, group in enumerate(groups):
                # Identify the "Best" to star it
                best_img = processor.identify_best_image(group)

                # Render the group UI
                marked = ui.render_group(i + 1, group, best_img, auto_select)
                all_marked_files.extend(marked)

            # E. Bulk Action
            # This floating button acts as the bulk delete for ALL selected images
            st.write("")
            st.markdown(f"### 🗑️ Selected {len(all_marked_files)} images for deletion")

            if st.form_submit_button("Trash All Selected", type="primary"):
                if all_marked_files:
                    count, errors = scanner.safe_delete(all_marked_files)
                    st.success(f"Moved {count} images to Trash!")
                    # Clear hash cache to force a re-scan next time
                    del st.session_state["hashes"]
                    st.rerun()
                else:
                    st.warning("No images selected.")
