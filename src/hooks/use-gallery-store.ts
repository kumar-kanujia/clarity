import * as app from "@/services/tauri";
import { selectDirs, selectImages } from "@/services/tauri/tauri-api";
import { toast } from "sonner";
import { create } from "zustand";

interface GalleryState {
  images: app.ImageDto[];
  groupedImages: app.ImageDto[][];
  isLoading: boolean;
  isScansLoading: boolean;
  hasMore: boolean;
  hasMoreGroups: boolean;
  nextCursor: app.ImageCursor | null;
  nextGroupCursor: number | null;
  userTags: app.TagDto[];
  systemTags: app.TagDto[];
  importSummary: app.ImportSummaryDto | null;
  loadImages: (isReset?: boolean) => Promise<void>;
  loadGroupedImages: (isReset?: boolean) => Promise<void>;
  fetchTags: () => Promise<void>;
  createTag: (text: string) => Promise<void>;
  importImages: () => Promise<void>;
  importFolder: () => Promise<void>;
  clearImportSummary: () => void;
}

const BATCH_SIZE = 30;

export const useGalleryStore = create<GalleryState>((set, get) => ({
  images: [],
  groupedImages: [],
  isLoading: false,
  isScansLoading: false,
  hasMore: true,
  hasMoreGroups: true,
  nextCursor: null,
  nextGroupCursor: null,
  userTags: [],
  systemTags: [],
  importSummary: null,

  loadImages: async (isReset = false) => {
    const { isLoading, nextCursor, hasMore } = get();
    if (isLoading || (!hasMore && !isReset)) return;

    set({ isLoading: true });

    try {
      const params: app.FetchImagesParams = {
        limit: BATCH_SIZE,
        cursor: isReset ? undefined : (nextCursor ?? undefined),
      };

      const result = await app.fetchImages(params);

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

  loadGroupedImages: async (isReset = false) => {
    const { isScansLoading, nextGroupCursor, hasMoreGroups } = get();
    if (isScansLoading || (!hasMoreGroups && !isReset)) return;

    set({ isScansLoading: true });

    try {
      const params: app.FetchImagesGroupedByHashParams = {
        limit: 10,
        nextCursor: isReset ? undefined : (nextGroupCursor ?? undefined),
      };

      const result = await app.fetchImagesGroupedByHash(params);

      set((state) => {
        const updatedGroups = isReset
          ? result.data
          : [...state.groupedImages, ...result.data];

        return {
          groupedImages: updatedGroups,
          nextGroupCursor: result.next_cursor ?? null,
          hasMoreGroups: !!result.next_cursor,
          isScansLoading: false,
        };
      });
    } catch (error) {
      console.error("Failed to load scans:", error);
      toast.error("Failed to load image scans");
      set({ isScansLoading: false });
    }
  },

  importImages: async () => {
    try {
      const files = await selectImages();
      if (files && files.length > 0) {
        set({ isLoading: true, importSummary: null });
        const summary = await app.importImages({
          paths: files,
        });
        set({ importSummary: summary });
        await get().loadImages(true);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  importFolder: async () => {
    try {
      const path = await selectDirs();
      if (path) {
        set({ isLoading: true, importSummary: null });
        const summary = await app.importImages({
          paths: typeof path === "string" ? [path] : path,
        });
        set({ importSummary: summary });
        await get().loadImages(true);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTags: async () => {
    try {
      const [userTags, systemTags] = await Promise.all([
        app.fetchUserTags(),
        app.fetchSystemTags(),
      ]);
      set({ userTags, systemTags });
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  },

  createTag: async (text: string) => {
    try {
      await app.createTag({ tagText: text });
      await get().fetchTags();
      toast.success("Tag created successfully");
    } catch (error) {
      console.error("Failed to create tag: this", error);
      toast.error("Failed to create tag");
    }
  },

  clearImportSummary: () => set({ importSummary: null }),
}));
