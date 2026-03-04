import { useMemo } from "react"
import {
  useSuspenseInfiniteQuery,
  type AnyUseSuspenseInfiniteQueryOptions
} from "@tanstack/react-query"

import type { ImageItemResult } from "@/tauri"

export const useImageGridData = <T extends AnyUseSuspenseInfiniteQueryOptions>(
  queryOptions: T
) => {
  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isFetching,
    isFetchNextPageError
  } = useSuspenseInfiniteQuery<ImageItemResult>(queryOptions)

  const images = useMemo(() => data.pages.flatMap((page) => page.data), [data])

  return {
    images,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isFetching,
    isFetchNextPageError
  }
}
