import type { TagItem } from "@/services/tauri"
import { create } from "zustand"

interface EditTagStore {
  isOpen: boolean
  tag: TagItem | null
  setTag: (tag: TagItem | null) => void
  changeIsOpen: () => void
}

const editTagStore = create<EditTagStore>((set) => ({
  isOpen: false,
  tag: null,
  setTag: (tag) => set({ tag }),
  changeIsOpen: () => set((state) => ({ isOpen: !state.isOpen }))
}))

export const useEditTagStore = () => {
  const { tag, setTag, changeIsOpen, isOpen } = editTagStore()

  const openEditDialog = (tag: TagItem) => {
    setTag(tag)
    changeIsOpen()
  }

  const closeEditDialog = () => {
    setTag(null)
    changeIsOpen()
  }

  return {
    tag,
    openEditDialog,
    closeEditDialog,
    isOpen
  }
}
