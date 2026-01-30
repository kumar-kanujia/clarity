import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

export interface ImageFile {
  name: string;
  path: string;
  size_bytes: number;
  width?: number;
  height?: number;
}
export const formatSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

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

  const loadedPhotos: ImageFile[] = await invoke("scan_folder", {
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
