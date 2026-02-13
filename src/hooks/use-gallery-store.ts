import { create } from "zustand";
import { Image, ImportSummary } from "@/types";
import { getSavedImagesBatch, saveImages } from "@/tauri/tauri-commands";
import { selectDirs, selectImages } from "@/tauri/tauri-api";
import { toast } from "sonner";

interface GalleryState {
  images: Image[];
  isLoading: boolean;
  hasMore: boolean;
  lastCreatedAt: number | null;
  lastSeqId: number | null;
  importSummary: ImportSummary | null;
  loadImages: (isReset?: boolean) => Promise<void>;
  importImages: () => Promise<void>;
  importFolder: () => Promise<void>;
  clearImportSummary: () => void;
}

const BATCH_SIZE = 50;

export const useGalleryStore = create<GalleryState>((set, get) => ({
  images: [],
  isLoading: false,
  hasMore: true,
  lastCreatedAt: null,
  lastSeqId: null,
  importSummary: null,

  loadImages: async (isReset = false) => {
    const { isLoading, lastCreatedAt, lastSeqId } = get();
    if (isLoading && !isReset) return;

    set({ isLoading: true });

    try {
      const currentCreatedAt =
        isReset || lastCreatedAt === null
          ? Math.floor(Date.now() / 1000) + 86400 // Today + 1 day to be safe
          : lastCreatedAt;
      const currentSeqId =
        isReset || lastSeqId === null ? Number.MAX_SAFE_INTEGER : lastSeqId;

      const newImages = await getSavedImagesBatch(
        currentCreatedAt,
        currentSeqId,
        BATCH_SIZE,
      );

      set((state) => {
        const hasMore = newImages.length >= BATCH_SIZE;
        const updatedImages = isReset
          ? newImages
          : [...state.images, ...newImages];

        const lastItem = newImages[newImages.length - 1];

        return {
          images: updatedImages,
          lastCreatedAt: lastItem
            ? lastItem.createdAt
            : isReset
              ? null
              : state.lastCreatedAt,
          lastSeqId: lastItem
            ? lastItem.seqId
            : isReset
              ? null
              : state.lastSeqId,
          hasMore,
          isLoading: false,
        };
      });
    } catch (error) {
      console.error("Failed to load library:", error);
      toast.error("Failed to load library images");
      set({ isLoading: false });
    }
  },

  importImages: async () => {
    try {
      const files = await selectImages();
      if (files && files.length > 0) {
        set({ isLoading: true, importSummary: null });
        const summary = await saveImages(files);
        set({ importSummary: summary });
        await get().loadImages(true);
      }
    } catch (error) {
      if (error instanceof Error && error.message !== "No files selected") {
        console.error("Failed to import images:", error);
        toast.error("Failed to import images");
      }
      set({ isLoading: false });
    }
  },

  importFolder: async () => {
    try {
      const path = await selectDirs();
      if (path) {
        set({ isLoading: true, importSummary: null });
        const summary = await saveImages(path);
        set({ importSummary: summary });
        await get().loadImages(true);
      }
    } catch (error) {
      if (error instanceof Error && error.message !== "No directory selected") {
        console.error("Failed to import folder:", error);
        toast.error("Failed to import folder");
      }
      set({ isLoading: false });
    }
  },

  clearImportSummary: () => set({ importSummary: null }),
}));
