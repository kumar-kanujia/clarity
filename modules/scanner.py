import os

from PIL import Image
from send2trash import send2trash

VALID_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp", ".heic")


def get_image_files(directory):
    """Recursively find image files."""
    image_paths = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(VALID_EXTENSIONS):
                image_paths.append(os.path.join(root, file))
    return image_paths


def get_file_info(file_path):
    """Returns formatted size (MB) and dimensions."""
    try:
        size_bytes = os.path.getsize(file_path)
        size_str = f"{size_bytes / (1024 * 1024):.2f} MB"

        with Image.open(file_path) as img:
            dims = f"{img.width}x{img.height}"

        return size_str, dims, size_bytes
    except Exception as e:
        print(f"Exception Occured! {e}")
        return "Unknown", "?x?", 0


def safe_delete(file_paths):
    """Moves files to trash."""
    deleted_count = 0
    errors = []
    for f in file_paths:
        try:
            send2trash(f)
            deleted_count += 1
        except Exception as e:
            errors.append(f"{f}: {str(e)}")
    return deleted_count, errors
