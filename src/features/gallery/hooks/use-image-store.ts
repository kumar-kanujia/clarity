import * as app from "@/services/tauri";
import { toast } from "sonner";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useTagStore } from "@/features/tags/hooks/use-tag-store";

const BATCH_SIZE = 30;

interface ImageState {
  images: app.ImageDto[];
  isLoading: boolean;
  hasMore: boolean;
  nextSearchCursor: app.ImageSearchCursor | null;

  // Filters & Sorting
  searchQuery: string;
  sortBy: app.ImageSortBy;
  order: app.SearchOrderBy;

  // Actions
  loadImages: (isReset?: boolean) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: app.ImageSortBy) => void;
  setOrder: (order: app.SearchOrderBy) => void;
}

export const useImageStore = create<ImageState>()(
  devtools((set, get) => ({
    images: [],
    isLoading: false,
    hasMore: true,
    nextSearchCursor: null,

    searchQuery: "",
    sortBy: "CreatedAt",
    order: "Desc",

    setSearchQuery: (query: string) => {
      set({ searchQuery: query }, false, "setSearchQuery");
    },
    setSortBy: (sortBy: app.ImageSortBy) => {
      set({ sortBy }, false, "setSortBy");
    },
    setOrder: (order: app.SearchOrderBy) => {
      set({ order }, false, "setOrder");
    },

    loadImages: async (isReset = false) => {
      const {
        isLoading,
        nextSearchCursor,
        hasMore,
        searchQuery,
        sortBy,
        order,
      } = get();

      if (isLoading || (!hasMore && !isReset)) return;

      set({ isLoading: true }, false, "loadImages/start");

      try {
        const { currentTagId } = useTagStore.getState();

        // Use search_images if we have search query, special sorting, or if it's just more robust
        // Actually, search_images is more flexible as it handles tags too.

        const filters: app.ImageFilters = {
          file_names: searchQuery ? [searchQuery] : [],
          tag_ids: currentTagId ? [currentTagId] : [],
        };

        const query: app.ImageSearchQuery = {
          filters,
          sort_by: sortBy,
          order: order,
          limit: BATCH_SIZE,
        };

        const result = await app.searchImages({
          query,
          cursor: isReset ? undefined : (nextSearchCursor ?? undefined),
        });

        set(
          (state) => ({
            images: isReset ? result.data : [...state.images, ...result.data],
            nextSearchCursor: result.next_cursor ?? null,
            hasMore: !!result.next_cursor,
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
  })),
);
