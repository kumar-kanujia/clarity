import * as app from "@/services/tauri";
import { selectDirs, selectImages } from "@/services/tauri/tauri-api";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useImageStore } from "@/features/gallery/hooks/use-image-store";

interface ImportState {
  importSummary: app.ImportSummaryDto | null;
  isLoading: boolean;

  // Actions
  importImages: () => Promise<void>;
  importFolder: () => Promise<void>;
  clearImportSummary: () => void;
}

export const useImportStore = create<ImportState>()(
  devtools((set) => ({
    importSummary: null,
    isLoading: false,

    importImages: async () => {
      try {
        const files = await selectImages();
        if (files && files.length > 0) {
          set(
            { isLoading: true, importSummary: null },
            false,
            "importImages/start",
          );
          const summary = await app.importImages({ paths: files });
          set({ importSummary: summary }, false, "importImages/summary");
          await useImageStore.getState().loadImages(true);
        }
      } finally {
        set({ isLoading: false }, false, "importImages/end");
      }
    },

    importFolder: async () => {
      try {
        const path = await selectDirs();
        if (path) {
          set(
            { isLoading: true, importSummary: null },
            false,
            "importFolder/start",
          );
          const summary = await app.importImages({
            paths: typeof path === "string" ? [path] : path,
          });
          set({ importSummary: summary }, false, "importFolder/summary");
          await useImageStore.getState().loadImages(true);
        }
      } finally {
        set({ isLoading: false }, false, "importFolder/end");
      }
    },

    clearImportSummary: () =>
      set({ importSummary: null }, false, "clearImportSummary"),
  })),
);
