import { Image } from "@/types";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

export async function loadImage() {
  const folder = await open({
    directory: true,
    multiple: false,
  });

  if (!folder)
    return {
      loadedPhotos: [],
      folder: "No folder selected",
    };

  const loadedPhotos: Image[] = await invoke("scan_dir_for_images", {
    path: folder,
  });

  return {
    loadedPhotos,
    folder,
  };
}

export function getFileURI(file: string) {
  return convertFileSrc(file);
}

/**
 * Scans for groups of similar images
 * @param dirPath - Folder to scan
 * @param threshold - Similarity threshold (e.g., 0-20)
 */
export async function scanForGroups(
  dirPath: string,
  threshold: number,
): Promise<Image[][]> {
  try {
    // 1. Call Rust
    const rawGroups = await invoke<Image[][]>("scan_and_group_duplicates", {
      path: dirPath,
      threshold: threshold,
    });

    // 2. Transform: Add 'src' for display to each image in the groups
    return rawGroups;
  } catch (error) {
    console.error("Failed to scan groups:", error);
    throw error;
  }
}
