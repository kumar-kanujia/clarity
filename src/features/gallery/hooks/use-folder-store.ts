import { createSelectors } from "@/lib/utils";
import { folderStore } from "../store/folder-store";

const folderStoreSelectors = createSelectors(folderStore);

export const useGetFolderStore = () => ({
  currentFolderPath: folderStoreSelectors.use.currentPath(),
  isFolderSelected: folderStoreSelectors.use.isFolderSelected(),
  setCurrentFolder: folderStoreSelectors.use.setCurrentPath(),
});
