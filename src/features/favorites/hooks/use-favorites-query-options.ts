import { fetchFavorites, type CreatedAtCursor } from "@/services/tauri"
import { infiniteQueryOptions } from "@tanstack/react-query"

export const favoriteQueryKey = ["all", "favorites"]

export const useFavoritesQueryOptions = () => {
  const option = infiniteQueryOptions({
    queryKey: favoriteQueryKey,
    queryFn: async ({ pageParam = null }) => {
      const res = await fetchFavorites({
        cursor: pageParam ?? undefined
      })
      return res
    },
    initialPageParam: null as CreatedAtCursor | null,
    getNextPageParam: (lastPage) => {
      return lastPage?.nextCursor ?? null
    }
  })

  return { queryKey: favoriteQueryKey, queryOption: option }
}
