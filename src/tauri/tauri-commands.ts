import { Image, ImportSummary } from "@/types";
import { invoke } from "@tauri-apps/api/core";

/**
 *
 * @param path - List of paths for images or folders
 * Scan the selected dir and save them in app storage
 */
export const saveImages = async (paths: string[]): Promise<ImportSummary> => {
  console.log(paths);
  try {
    let summary = await invoke<ImportSummary>("save_images", {
      paths,
    });
    return summary;
  } catch (err) {
    console.error("errr", err);
    throw new Error("Failed to load dir");
  }
};

// Fetch Images from now
export const getSavedImagesBatch = async (
  createdAt: number,
  lastSeqId: number,
  limit: number,
) => {
  try {
    const loadedFiles = await invoke<Image[]>("fetch_scanned_images", {
      lastMaxTx: createdAt,
      lastSeqId,
      limit,
    });
    return loadedFiles;
  } catch (err) {
    console.error("errr", err);
    throw new Error("Failed to get loaded files");
  }
};

export const getImagesGroupedByHash = async () => {
  try {
    const loadedGroups = await invoke<Image[][]>(
      "fetch_images_grouped_by_hash",
    );
    return loadedGroups;
  } catch (err) {
    console.error("errr", err);
    throw new Error("Failed to get loaded groups");
  }
};
