import type { TagItem } from "@/services/tauri"
import { create } from "zustand"

interface TagDeleteStore {
  tag: TagItem | null
  setTag: (tag: TagItem | null) => void
}

const tagDeleteStore = create<TagDeleteStore>((set) => ({
  tag: null,
  setTag: (tag) => set({ tag })
}))

export const useTagDeleteStore = () => {
  const { tag, setTag } = tagDeleteStore()

  const openDeleteDialog = (tag: TagItem) => {
    setTag(tag)
  }

  const closeDeleteDialog = () => {
    setTag(null)
  }

  return {
    tag,
    openDeleteDialog,
    closeDeleteDialog
  }
}
