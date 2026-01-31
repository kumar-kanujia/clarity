import { createSelectors } from "@/lib/utils";
import { useScannerStore } from "../store/scanner-store";

const scannerStoreSelectors = createSelectors(useScannerStore);

/**
 * Custom hook to access scanner store state and actions.
 * Exports individual selectors for better performance and cleaner API.
 */
export const useGetScannerStore = () => ({
  appState: scannerStoreSelectors.use.appState(),
  images: scannerStoreSelectors.use.images(),
  groups: scannerStoreSelectors.use.groups(),
  threshold: scannerStoreSelectors.use.threshold(),
  loadingText: scannerStoreSelectors.use.loadingText(),
  selectedImages: scannerStoreSelectors.use.selectedImages(),

  // Actions
  setAppState: scannerStoreSelectors.use.setAppState(),
  setImages: scannerStoreSelectors.use.setImages(),
  setGroups: scannerStoreSelectors.use.setGroups(),
  setThreshold: scannerStoreSelectors.use.setThreshold(),
  setLoadingText: scannerStoreSelectors.use.setLoadingText(),
  toggleImageSelection: scannerStoreSelectors.use.toggleImageSelection(),
  selectAllExceptBest: scannerStoreSelectors.use.selectAllExceptBest(),
  clearSelection: scannerStoreSelectors.use.clearSelection(),
  deleteImages: scannerStoreSelectors.use.deleteImages(),
  reset: scannerStoreSelectors.use.reset(),
});
