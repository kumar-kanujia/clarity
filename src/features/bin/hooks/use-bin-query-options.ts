import { fetchBin, type CreatedAtCursor } from "@/services/tauri"
import { infiniteQueryOptions } from "@tanstack/react-query"

export const binQueryKey = ["bin"]

export const getBinQueryOptions = () =>
  infiniteQueryOptions({
    queryKey: binQueryKey,
    queryFn: async ({ pageParam = null }) => {
      const res = await fetchBin({
        cursor: pageParam ?? undefined
      })
      return res
    },
    initialPageParam: null as CreatedAtCursor | null,
    getNextPageParam: (lastPage) => {
      return lastPage?.nextCursor ?? null
    }
  })
