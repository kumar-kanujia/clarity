import { infiniteQueryOptions } from "@tanstack/react-query"

import { fetchGallery, type CreatedAtCursor } from "@/services/tauri"

export const galleryQueryKey = ["main-gallery"]

export const getGalleryQueryOptions = () =>
  infiniteQueryOptions({
    queryKey: galleryQueryKey,
    queryFn: async ({ pageParam = null }) => {
      const res = await fetchGallery({
        cursor: pageParam ?? undefined
      })
      return res
    },
    initialPageParam: null as CreatedAtCursor | null,
    getNextPageParam: (lastPage) => {
      return lastPage?.nextCursor ?? null
    }
  })
