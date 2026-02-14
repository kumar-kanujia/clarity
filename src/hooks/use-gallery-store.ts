import { create } from "zustand";
import * as tauri from "@/tauri";
import { selectDirs, selectImages } from "@/tauri/tauri-api";
import { toast } from "sonner";

interface GalleryState {
  images: tauri.ImageDto[];
  isLoading: boolean;
  hasMore: boolean;
  nextCursor: tauri.ImageCursor | null;
  importSummary: tauri.ImportSummaryDto | null;
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
  nextCursor: null,
  importSummary: null,

  loadImages: async (isReset = false) => {
    const { isLoading, nextCursor, hasMore } = get();
    if (isLoading || (!hasMore && !isReset)) return;

    set({ isLoading: true });

    try {
      const params: tauri.FetchImagesParams = {
        limit: BATCH_SIZE,
        cursor: isReset ? undefined : (nextCursor ?? undefined),
      };

      const result = await tauri.fetchImages(params);

      set((state) => {
        const updatedImages = isReset
          ? result.data
          : [...state.images, ...result.data];

        return {
          images: updatedImages,
          nextCursor: result.nextCursor ?? null,
          hasMore: !!result.nextCursor,
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
        const summary = await tauri.importImages({ paths: files });
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
        const summary = await tauri.importImages({
          paths: typeof path === "string" ? [path] : path,
        });
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
