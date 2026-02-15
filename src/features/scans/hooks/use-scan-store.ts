import * as app from "@/services/tauri";
import { toast } from "sonner";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ScanState {
  groupedImages: app.ImageDto[][];
  isScansLoading: boolean;
  hasMoreGroups: boolean;
  nextGroupCursor: number | null;

  // Actions
  loadGroupedImages: (isReset?: boolean) => Promise<void>;
}

export const useScanStore = create<ScanState>()(
  devtools((set, get) => ({
    groupedImages: [],
    isScansLoading: false,
    hasMoreGroups: true,
    nextGroupCursor: null,

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
  })),
);
