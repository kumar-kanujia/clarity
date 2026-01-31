import { create } from "zustand";

interface FolderStore {
  isFolderSelected: boolean;
  currentPath: string;
  setCurrentPath: (path: string) => void;
}

export const folderStore = create<FolderStore>((set) => ({
  isFolderSelected: false,
  currentPath: "",
  setCurrentPath: (path: string) => {
    if (path.length > 0) {
      set({ isFolderSelected: true, currentPath: path });
    } else {
      set({ isFolderSelected: false, currentPath: "" });
    }
  },
}));
