import imagehash
import streamlit as st
from PIL import Image


@st.cache_data(show_spinner=False)
def compute_hashes(image_paths):
    """Compute perceptual hash for all images with progress tracking."""
    hashes = {}

    # Create a placeholder for the progress bar in the UI
    progress_bar = st.progress(0)
    status_text = st.empty()

    total = len(image_paths)
    for i, path in enumerate(image_paths):
        try:
            with Image.open(path) as img:
                hashes[path] = imagehash.phash(img)
        except Exception:
            continue  # Skip bad images

        # Update UI every 10 images to save resources
        if i % 10 == 0:
            progress = (i + 1) / total
            progress_bar.progress(progress)
            status_text.text(f"Processing {i + 1}/{total}")

    progress_bar.empty()
    status_text.empty()
    return hashes


@st.cache_data
def group_images(hashes, threshold):
    """Group images based on hash difference."""
    groups = []
    visited = set()
    paths = list(hashes.keys())

    for i in range(len(paths)):
        path_a = paths[i]
        if path_a in visited:
            continue

        current_group = [path_a]
        visited.add(path_a)
        hash_a = hashes[path_a]

        for j in range(i + 1, len(paths)):
            path_b = paths[j]
            if path_b in visited:
                continue

            # The Magic: Compare Hash Difference
            if hash_a - hashes[path_b] <= threshold:
                current_group.append(path_b)
                visited.add(path_b)

        if len(current_group) > 1:
            groups.append(current_group)

    return groups
