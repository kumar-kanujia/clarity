import { create } from "zustand";
import { AppState, Image } from "../../../types";

interface ScannerState {
  appState: AppState;
  images: Image[];
  groups: Image[][];
  threshold: number;
  loadingText: string;
  selectedImages: Set<string>;

  // Actions
  setAppState: (state: AppState) => void;
  setImages: (images: Image[]) => void;
  setGroups: (groups: Image[][]) => void;
  setThreshold: (threshold: number) => void;
  setLoadingText: (text: string) => void;
  toggleImageSelection: (path: string, groupIdx: number) => void;
  selectAllExceptBest: (groupIdx: number) => void;
  clearSelection: () => void;
  deleteImages: (paths: string[]) => void;
  reset: () => void;
}

export const useScannerStore = create<ScannerState>((set, get) => ({
  appState: "INIT",
  images: [],
  groups: [],
  threshold: 5,
  loadingText: "Processing...",
  selectedImages: new Set<string>(),

  setAppState: (state) => {
    const { appState } = get();
    // Reset selection when moving back to PREVIEW from RESULTS
    if (state === "PREVIEW" && appState === "RESULTS") {
      set({ appState: state, selectedImages: new Set() });
    } else {
      set({ appState: state });
    }
  },
  setImages: (images) => set({ images }),
  setGroups: (groups) => set({ groups }),
  setThreshold: (threshold) => set({ threshold }),
  setLoadingText: (loadingText) => set({ loadingText }),

  toggleImageSelection: (path, groupIdx) => {
    const { groups, selectedImages } = get();
    const group = groups[groupIdx];

    if (!group) return;

    const newSelected = new Set(selectedImages);
    if (newSelected.has(path)) {
      newSelected.delete(path);
    } else {
      newSelected.add(path);
    }
    set({ selectedImages: newSelected });
  },

  selectAllExceptBest: (groupIdx) => {
    const { groups, selectedImages } = get();
    const group = groups[groupIdx];
    if (!group) return;

    const newSelected = new Set(selectedImages);

    // Sort group by similarity score or criteria to find the "best"
    // For now, index 0 is best as per scan results logic usually?
    // Let's assume the first image is always the "best" (as per ImageCard isBest logic)
    group.forEach((img, idx) => {
      if (idx === 0) {
        newSelected.delete(img.path);
      } else {
        newSelected.add(img.path);
      }
    });

    set({ selectedImages: newSelected });
  },

  clearSelection: () => set({ selectedImages: new Set() }),

  deleteImages: (paths) => {
    const { images, groups, selectedImages } = get();
    const pathsSet = new Set(paths);

    const newImages = images.filter((img) => !pathsSet.has(img.path));
    const newGroups = groups
      .map((group) => group.filter((img) => !pathsSet.has(img.path)))
      .filter((group) => group.length > 1);

    const newSelected = new Set(selectedImages);
    paths.forEach((p) => newSelected.delete(p));

    set({
      images: newImages,
      groups: newGroups,
      selectedImages: newSelected,
    });
  },

  reset: () =>
    set({
      appState: "INIT",
      images: [],
      groups: [],
      threshold: 5,
      selectedImages: new Set(),
    }),
}));
