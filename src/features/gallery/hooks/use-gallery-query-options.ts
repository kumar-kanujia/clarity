import { fetchGallery, type CreatedAtCursor } from "@/services/tauri"
import { infiniteQueryOptions } from "@tanstack/react-query"

export const galleryQueryKey = ["all", "gallery"]

export const useGalleryQueryOptions = () => {
  const option = infiniteQueryOptions({
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

  return { queryKey: galleryQueryKey, queryOption: option }
}
