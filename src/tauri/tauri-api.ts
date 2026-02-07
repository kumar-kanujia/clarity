import { convertFileSrc } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

// Convert file path to image URI
export function getFileURI(file: string) {
  return convertFileSrc(file);
}

// Opens a dialog to select a folder
export const selectDir = async () => {
  const dir = await open({
    directory: true,
    multiple: false,
  });

  if (dir) {
    return dir;
  } else {
    throw new Error("No directory selected");
  }
};
