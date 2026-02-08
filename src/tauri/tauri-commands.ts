import { Image } from "@/types";
import { invoke } from "@tauri-apps/api/core";

/**
 * Loads all images from a directory
 * @param path - Folder to scan
 */
export const loadImagesFromDir = async (path: string): Promise<Image[]> => {
  const loadedPhotos: Image[] = await invoke("scan_dir_for_images", {
    path
  });
  return loadedPhotos;
};

/**
 * Scans for groups of similar images
 * @param dirPath - Folder to scan
 * @param threshold - Similarity threshold (e.g., 0-20)
 */
export const scanForGroups = async (
  dirPath: string,
  threshold: number
): Promise<Image[][]> => {
  try {
    const imageGroup = await invoke<Image[][]>("scan_and_group_duplicates", {
      path: dirPath,
      threshold: threshold
    });
    return imageGroup;
  } catch (_) {
    throw new Error("Failed to scan groups");
  }
};

/**
 * Moves images to trash
 * @param images - Images to move
 */
export async function moveToTrash(images: Image[]) {
  const paths = images.map((image) => image.path);
  try {
    await invoke("move_to_trash", {
      paths: paths
    });
  } catch (_) {
    throw new Error("Failed to move to trash");
  }
}

export const saveImages = async (files: string[]) => {
  try {
    await invoke<void>("save_images", {
      files
    });
  } catch (_) {
    throw new Error("Failed to save images");
  }
};

/**
 *
 * @param path - dir path to scan
 * Scan the selected dir and save them in app storage
 */
export const saveDir = async (path: string) => {
  try {
    await invoke<void>("save_dir", {
      path
    });
  } catch (_) {
    throw new Error("Failed to load dir");
  }
};

/**
 *
 * @returns saved images in app storage
 */
export const getSavedImages = async () => {
  try {
    const loadedFiles = await invoke<Image[]>("get_saved_images");
    return loadedFiles;
  } catch (_) {
    throw new Error("Failed to get loaded files");
  }
};
