import { fetchTagGallery, type CreatedAtCursor } from "@/services/tauri"
import { infiniteQueryOptions } from "@tanstack/react-query"

export const tagQueryKey = ["tags"]

export const getTagQueryOptions = (tagId: number) =>
  infiniteQueryOptions({
    queryKey: [...tagQueryKey, tagId],
    queryFn: async ({ pageParam = null }) => {
      const res = await fetchTagGallery({
        tagId,
        cursor: pageParam ?? undefined
      })
      return res
    },
    initialPageParam: null as CreatedAtCursor | null,
    getNextPageParam: (lastPage) => {
      return lastPage?.nextCursor ?? null
    }
  })
