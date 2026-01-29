import os

import imagehash
import streamlit as st
from PIL import Image


@st.cache_data(show_spinner=False)
def compute_hashes(image_paths):
    """Compute hashes (Heavy lifting - Cached)."""
    hashes = {}
    progress_bar = st.progress(0)
    total = len(image_paths)

    for i, path in enumerate(image_paths):
        try:
            with Image.open(path) as img:
                hashes[path] = imagehash.phash(img)
        except Exception as e:
            print(f"Exception Occured! {e}")

        if i % 5 == 0:
            progress_bar.progress((i + 1) / total)

    progress_bar.empty()
    return hashes


def group_images(hashes, threshold):
    """Group images (Fast - Runs when slider moves)."""
    groups = []
    visited = set()
    paths = list(hashes.keys())

    for i in range(len(paths)):
        path_a = paths[i]
        if path_a in visited:
            continue

        current_group = [path_a]
        visited.add(path_a)

        for j in range(i + 1, len(paths)):
            path_b = paths[j]
            if path_b in visited:
                continue

            # Compare hashes
            if hashes[path_a] - hashes[path_b] <= threshold:
                current_group.append(path_b)
                visited.add(path_b)

        if len(current_group) > 1:
            groups.append(current_group)

    return groups


def identify_best_image(group_files):
    """Identifies the largest file in the group as the 'best'."""
    # Return the path of the file with the largest size
    return max(group_files, key=lambda x: os.path.getsize(x))
