import { Image, ImportSummary } from "@/types";
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
  const paths = images.map((image) => image.filePath);
  try {
    await invoke("move_to_trash", {
      paths: paths
    });
  } catch (_) {
    throw new Error("Failed to move to trash");
  }
}

/**
 *
 * @param path - List of paths for images or folders
 * Scan the selected dir and save them in app storage
 */
export const saveImages = async (paths: string[]): Promise<ImportSummary> => {
  console.log(paths);
  try {
    let summary = await invoke<ImportSummary>("save_images", {
      paths
    });
    return summary;
  } catch (err) {
    console.error("errr", err);
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

export const getSavedImagesBatch = async (offset: number, limit: number) => {
  try {
    const loadedFiles = await invoke<Image[]>("load_saved_images_in_batch", {
      offset,
      limit
    });
    return loadedFiles;
  } catch (_) {
    throw new Error("Failed to get loaded files");
  }
};
