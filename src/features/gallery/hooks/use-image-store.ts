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
  nextCursor: app.ImageCursor | null;

  // Actions
  loadImages: (isReset?: boolean) => Promise<void>;
}

export const useImageStore = create<ImageState>()(
  devtools((set, get) => ({
    images: [],
    isLoading: false,
    hasMore: true,
    nextCursor: null,

    loadImages: async (isReset = false) => {
      const { isLoading, nextCursor, hasMore } = get();
      if (isLoading || (!hasMore && !isReset)) return;

      set({ isLoading: true }, false, "loadImages/start");

      try {
        const { currentTagId } = useTagStore.getState();
        let result: app.PaginatedImages;

        if (currentTagId) {
          result = await app.fetchImagesWithTag({
            tagId: currentTagId,
            limit: BATCH_SIZE,
            cursor: isReset ? undefined : (nextCursor ?? undefined),
          });
        } else {
          result = await app.fetchImages({
            limit: BATCH_SIZE,
            cursor: isReset ? undefined : (nextCursor ?? undefined),
          });
        }

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
  })),
);
