import { fetchTagGallery, type CreatedAtCursor } from "@/services/tauri"
import { infiniteQueryOptions } from "@tanstack/react-query"

export const useTagQueryOptions = (tagId: number) => {
  const option = infiniteQueryOptions({
    queryKey: ["all", "tags", tagId],
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

  return { queryKey: tagId, queryOption: option }
}
