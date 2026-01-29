import os

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


def get_file_size_mb(path):
    try:
        size = os.path.getsize(path)
        return f"{size / (1024 * 1024):.2f} MB"
    except:
        return "Unknown"


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
