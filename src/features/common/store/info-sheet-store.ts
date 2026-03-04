import type { ImageItem } from "@/tauri"
import { create } from "zustand"

interface ImageSheetState {
  type: "image"
  image: ImageItem
}

type InfoSheetState = ImageSheetState

interface InfoStore {
  state: InfoSheetState | null
  setState: (state: InfoSheetState | null) => void
}

const infoStore = create<InfoStore>((set) => ({
  state: null,
  setState: (state) => set({ state })
}))

export const useInfoStore = () => {
  const { state, setState } = infoStore()

  const openInfoSheet = (image: ImageItem) => {
    console.log(image)
    setState({ type: "image", image })
  }

  const closeInfoSheet = () => {
    setState(null)
  }
  return {
    state,
    openInfoSheet,
    closeInfoSheet
  }
}
