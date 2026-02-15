import * as app from "@/services/tauri";
import { toast } from "sonner";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface TagState {
  userTags: app.TagDto[];
  systemTags: app.TagDto[];
  currentTagId: number | null;
  appliedTags: Record<number, number[]>; // imageId -> tagIds[]

  // Actions
  fetchTags: () => Promise<void>;
  setCurrentTagId: (tagId: number | null) => void;
  createTag: (text: string) => Promise<number>;
  deleteTag: (tagId: number) => Promise<void>;
  toggleTagOnImage: (imageId: number, tagId: number) => Promise<void>;
}

export const useTagStore = create<TagState>()(
  devtools((set, get) => ({
    userTags: [],
    systemTags: [],
    currentTagId: null,
    appliedTags: {},

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

    setCurrentTagId: (tagId: number | null) => {
      set({ currentTagId: tagId }, false, "setCurrentTagId");
    },

    createTag: async (text: string) => {
      try {
        const tagId = await app.createTag({ tagText: text });
        await get().fetchTags();
        toast.success("Tag created successfully");
        return tagId;
      } catch (error) {
        console.error("Failed to create tag:", error);
        toast.error(`Failed to create tag: ${error}`);
        throw error;
      }
    },

    deleteTag: async (tagId: number) => {
      try {
        await app.deleteTag({ tagId });
        await get().fetchTags();
        toast.success("Tag deleted successfully");
      } catch (error) {
        console.error("Failed to delete tag:", error);
        toast.error("Failed to delete tag");
      }
    },

    toggleTagOnImage: async (imageId: number, tagId: number) => {
      try {
        const isAdded = await app.toggleTagOnImage({ imageId, tagId: 2 });

        set(
          (state) => {
            const currentTags = state.appliedTags[imageId] || [];
            const nextTags = isAdded
              ? [...currentTags, tagId]
              : currentTags.filter((id) => id !== tagId);

            return {
              appliedTags: {
                ...state.appliedTags,
                [imageId]: nextTags,
              },
            };
          },
          false,
          "toggleTagOnImage/feedback",
        );

        await get().fetchTags();
        toast.success(isAdded ? "Tag added" : "Tag removed");
      } catch (error) {
        console.error("Failed to toggle tag:", error);
        toast.error("Failed to update tags");
      }
    },
  })),
);
