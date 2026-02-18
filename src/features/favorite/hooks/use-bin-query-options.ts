import {
  fetchFavorites,
  type CreatedAtCursor,
  type ImageItemResult
} from "@/services/tauri"
import { infiniteQueryOptions, type InfiniteData } from "@tanstack/react-query"

export const useFavoritesQueryOptions = () => {
  const queryKey = ["favorites"]

  const option = infiniteQueryOptions<
    ImageItemResult,
    Error,
    InfiniteData<ImageItemResult>,
    readonly unknown[],
    CreatedAtCursor | null
  >({
    queryKey: queryKey,
    queryFn: async ({ pageParam = null }) => {
      const res = await fetchFavorites({
        cursor: pageParam ?? undefined
      })
      return res
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      return lastPage?.nextCursor ?? null
    }
  })

  return { queryKey, queryOption: option }
}
