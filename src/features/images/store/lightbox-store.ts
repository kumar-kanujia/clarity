import { create } from "zustand"

interface LightboxStore {
  index: number
  setIndex: (index: number) => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const lightboxStore = create<LightboxStore>((set) => ({
  index: 0,
  setIndex: (index) => set({ index }),
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen })
}))

export const useLightBox = () => {
  const { index, isOpen, setIndex, setIsOpen } = lightboxStore()

  const changeIndex = (cb: (prev: number) => number) => {
    setIndex(cb(index))
  }

  const close = () => {
    setIsOpen(false)
  }

  const open = (index: number) => {
    setIsOpen(true)
    setIndex(index)
  }

  return {
    index,
    isOpen,
    changeIndex,
    close,
    open
  }
}

import { useEffect } from "react"

export const useLightboxPrefetch = ({
  totalImages,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage
}: {
  totalImages: number
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}) => {
  const { index, isOpen } = lightboxStore()
  useEffect(() => {
    if (!isOpen || !hasNextPage || isFetchingNextPage) return
    const nearingEnd = index + 4 >= totalImages
    if (nearingEnd) fetchNextPage()
  }, [
    isOpen,
    index,
    totalImages,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  ])
}
