import {
  fetchBin,
  type CreatedAtCursor,
  type ImageItemResult
} from "@/services/tauri"
import { infiniteQueryOptions, type InfiniteData } from "@tanstack/react-query"

export const useBinQueryOptions = () => {
  const queryKey = ["bin"]

  const option = infiniteQueryOptions<
    ImageItemResult,
    Error,
    InfiniteData<ImageItemResult>,
    readonly unknown[],
    CreatedAtCursor | null
  >({
    queryKey: queryKey,
    queryFn: async ({ pageParam = null }) => {
      const res = await fetchBin({
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
