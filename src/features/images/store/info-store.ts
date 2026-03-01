import type { ImageItem } from "@/tauri"
import { create } from "zustand"

interface InfoStore {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  image: ImageItem | null
  setImage: (image: ImageItem | null) => void
}

const infoStore = create<InfoStore>((set) => ({
  isOpen: true,
  setIsOpen: (isOpen) => set({ isOpen }),
  image: null,
  setImage: (image) => set({ image })
}))

export const useInfoStore = () => {
  const { isOpen, setIsOpen, image, setImage } = infoStore()

  const openInfoSheet = (image: ImageItem) => {
    setIsOpen(true)
    setImage(image)
  }

  const closeInfoSheet = () => {
    setIsOpen(false)
    setImage(null)
  }
  return {
    isOpen,
    image,
    openInfoSheet,
    closeInfoSheet
  }
}
