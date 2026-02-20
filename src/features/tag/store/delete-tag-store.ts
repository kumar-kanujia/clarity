import type { TagItem } from "@/services/tauri"
import { create } from "zustand"

interface DeleteTagStore {
  tag: TagItem | null
  setTag: (tag: TagItem | null) => void
}

const deleteTagStore = create<DeleteTagStore>((set) => ({
  tag: null,
  setTag: (tag) => set({ tag })
}))

export const useDeleteTagStore = () => {
  const { tag, setTag } = deleteTagStore()

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
