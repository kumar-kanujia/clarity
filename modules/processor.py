import os

import imagehash
from PIL import Image


def compute_hashes(image_paths, progress_callback=None):
    """
    Computes hashes for a list of images.
    progress_callback: function(current_index, total_count)
    """
    hashes = {}
    total = len(image_paths)

    # ... inside compute_hashes ...
    for i, path in enumerate(image_paths):
        try:
            with Image.open(path) as img:
                # Perceptual hash is robust against resizing/minor edits
                hashes[path] = imagehash.phash(img)
        # FIXED: Catch specific exception (or Exception base class)
        except Exception:
            continue  # Skip corrupt/unreadable files

        if progress_callback and i % 5 == 0:
            progress_callback(i, total)

    return hashes


def group_images(hashes, threshold=5):
    """Groups images based on hash difference (Hamming distance)."""
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

            # The core comparison logic
            if hash_a - hashes[path_b] <= threshold:
                current_group.append(path_b)
                visited.add(path_b)

        if len(current_group) > 1:
            groups.append(current_group)

    return groups


def identify_best_image(group_files):
    """Returns the path of the largest file in the group."""
    if not group_files:
        return None
    return max(group_files, key=lambda x: os.path.getsize(x))
