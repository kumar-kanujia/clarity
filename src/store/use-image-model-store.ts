import type { ImageItem } from "@/services/tauri"
import { create } from "zustand"

interface ImageModalState {
  isOpen: boolean
  index: number

  getImages: (() => ImageItem[]) | null

  open: (getter: () => ImageItem[], index: number) => void
  close: () => void

  next: () => void
  prev: () => void
}

export const useImageModal = create<ImageModalState>((set, get) => ({
  isOpen: false,
  index: 0,
  getImages: null,

  open: (getter, index) =>
    set({
      isOpen: true,
      getImages: getter,
      index
    }),

  close: () =>
    set({
      isOpen: false,
      getImages: null,
      index: 0
    }),

  next: () => {
    const images = get().getImages?.() ?? []
    const index = get().index

    if (index < images.length - 1) {
      set({ index: index + 1 })
    }
  },

  prev: () => {
    const index = get().index

    if (index > 0) {
      set({ index: index - 1 })
    }
  }
}))
