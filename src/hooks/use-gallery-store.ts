import * as app from "@/services/tauri";
import { selectDirs, selectImages } from "@/services/tauri/tauri-api";
import { toast } from "sonner";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface GalleryState {
  // Image State
  images: app.ImageDto[];
  groupedImages: app.ImageDto[][];
  isLoading: boolean;
  isScansLoading: boolean;
  hasMore: boolean;
  hasMoreGroups: boolean;
  nextCursor: app.ImageCursor | null;
  nextGroupCursor: number | null;

  // Tag State
  userTags: app.TagDto[];
  systemTags: app.TagDto[];

  // Import State
  importSummary: app.ImportSummaryDto | null;

  // Actions
  loadImages: (isReset?: boolean) => Promise<void>;
  loadGroupedImages: (isReset?: boolean) => Promise<void>;
  fetchTags: () => Promise<void>;
  createTag: (text: string) => Promise<void>;
  deleteTag: (tagId: number) => Promise<void>;
  toggleTagOnImage: (imageId: number, tagId: number) => Promise<void>;
  importImages: () => Promise<void>;
  importFolder: () => Promise<void>;
  clearImportSummary: () => void;
}

const BATCH_SIZE = 30;

export const useGalleryStore = create<GalleryState>()(
  devtools((set, get) => ({
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

      set({ isLoading: true }, false, "loadImages/start");

      try {
        const params: app.FetchImagesParams = {
          limit: BATCH_SIZE,
          cursor: isReset ? undefined : (nextCursor ?? undefined),
        };

        const result = await app.fetchImages(params);

        set(
          (state) => ({
            images: isReset ? result.data : [...state.images, ...result.data],
            nextCursor: result.nextCursor ?? null,
            hasMore: !!result.nextCursor,
            isLoading: false,
          }),
          false,
          "loadImages/success",
        );
      } catch (error) {
        console.error("Failed to load library:", error);
        toast.error("Failed to load library images");
        set({ isLoading: false }, false, "loadImages/error");
      }
    },

    loadGroupedImages: async (isReset = false) => {
      const { isScansLoading, nextGroupCursor, hasMoreGroups } = get();
      if (isScansLoading || (!hasMoreGroups && !isReset)) return;

      set({ isScansLoading: true }, false, "loadGroupedImages/start");

      try {
        const params: app.FetchImagesGroupedByHashParams = {
          limit: 10,
          nextCursor: isReset ? undefined : (nextGroupCursor ?? undefined),
        };

        const result = await app.fetchImagesGroupedByHash(params);

        set(
          (state) => ({
            groupedImages: isReset
              ? result.data
              : [...state.groupedImages, ...result.data],
            nextGroupCursor: result.next_cursor ?? null,
            hasMoreGroups: !!result.next_cursor,
            isScansLoading: false,
          }),
          false,
          "loadGroupedImages/success",
        );
      } catch (error) {
        console.error("Failed to load scans:", error);
        toast.error("Failed to load image scans");
        set({ isScansLoading: false }, false, "loadGroupedImages/error");
      }
    },

    fetchTags: async () => {
      try {
        const [userTags, systemTags] = await Promise.all([
          app.fetchUserTags(),
          app.fetchSystemTags(),
        ]);
        set({ userTags, systemTags }, false, "fetchTags/success");
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
        console.error("Failed to create tag:", error);
        toast.error(`Failed to create tag: ${error}`);
      }
    },

    deleteTag: async (tagId: number) => {
      try {
        await app.deleteTag({ tagId });
        await get().fetchTags();
        // Also update local images if they had this tag (optional but cleaner)
        toast.success("Tag deleted successfully");
      } catch (error) {
        console.error("Failed to delete tag:", error);
        toast.error("Failed to delete tag");
      }
    },

    toggleTagOnImage: async (imageId: number, tagId: number) => {
      try {
        const isAdded = await app.toggleTagOnImage({ imageId, tagId });

        // Refresh tags to get updated counts
        await get().fetchTags();

        // If we want to be truly atomic, we might need tag info on ImageDto
        // Currently ImageDto doesn't seem to have tags in its definition

        toast.success(isAdded ? "Tag added" : "Tag removed");
      } catch (error) {
        console.error("Failed to toggle tag:", error);
        toast.error("Failed to update tags");
      }
    },

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
          await get().loadImages(true);
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
          await get().loadImages(true);
        }
      } finally {
        set({ isLoading: false }, false, "importFolder/end");
      }
    },

    clearImportSummary: () =>
      set({ importSummary: null }, false, "clearImportSummary"),
  })),
);
