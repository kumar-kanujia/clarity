import { convertFileSrc } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

const allowedExtensions = ["jpg", "jpeg", "png", "webp", "bmp", "gif", "heic"];

export function getFileURI(file: string) {
  return convertFileSrc(file);
}

export const selectDir = async () => {
  const dir = await open({
    directory: true,
    multiple: false
  });
  if (dir) {
    return dir;
  } else {
    throw new Error("No directory selected");
  }
};

export const selectDirs = async () => {
  const dirs = await open({
    directory: true,
    multiple: true
  });

  if (dirs && dirs.length > 0) {
    return dirs;
  } else {
    throw new Error("No directory selected");
  }
};

export const selectImages = async () => {
  const files = await open({
    multiple: true,
    directory: false,
    filters: [
      {
        name: "Images",
        extensions: allowedExtensions
      }
    ]
  });

  if (files && files.length > 0) {
    return files;
  } else {
    throw new Error("No files selected");
  }
};
