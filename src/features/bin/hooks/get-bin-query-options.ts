import { infiniteQueryOptions } from "@tanstack/react-query"
import { fetchBin, type CreatedAtCursor } from "@/services/tauri"

export const binQueryKey = ["bin"]

export const getBinQueryOptions = () =>
  infiniteQueryOptions({
    queryKey: binQueryKey,
    queryFn: ({ pageParam }) => fetchBin({ cursor: pageParam ?? undefined }),
    initialPageParam: null as CreatedAtCursor | null,
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null
  })
