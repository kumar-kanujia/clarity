import { create } from "zustand"

interface SelectStoreStore {
  imageIds: Set<number>
  reset: () => void
  toggleImage: (id: number) => void
}

const selectStore = create<SelectStoreStore>((set, get) => ({
  imageIds: new Set(),
  toggleImage: (id) => {
    const imageIds = get().imageIds
    if (imageIds.has(id)) {
      imageIds.delete(id)
    } else {
      imageIds.add(id)
    }
    set({ imageIds })
  },
  reset: () => {
    set({ imageIds: new Set() })
  }
}))

export const useSelectStore = () => {
  const { imageIds, toggleImage, reset } = selectStore()

  const toggle = (id: number) => {
    toggleImage(id)
  }

  return {
    imageIds,
    toggle,
    reset
  }
}
