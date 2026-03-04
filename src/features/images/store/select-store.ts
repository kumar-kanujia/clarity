import { create } from "zustand"

interface SelectStore {
  selectedIds: Set<number>
  selectMany: (ids: number[]) => void
  toggleSelect: (id: number) => void
  reset: () => void
}

export const useSelectStore = create<SelectStore>((set, get) => ({
  selectedIds: new Set(),
  toggleSelect: (id) => {
    const selectedIds = get().selectedIds
    if (selectedIds.has(id)) {
      selectedIds.delete(id)
    } else {
      selectedIds.add(id)
    }
    set({ selectedIds })
  },
  selectMany: (ids) => {
    const selectedIds = get().selectedIds
    for (const id of ids) {
      selectedIds.add(id)
    }
    set({ selectedIds })
  },
  reset: () => {
    set({ selectedIds: new Set() })
  }
}))
