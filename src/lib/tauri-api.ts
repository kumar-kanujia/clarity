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

  const loadedPhotos: string[] = await invoke("scan_folder", {
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
