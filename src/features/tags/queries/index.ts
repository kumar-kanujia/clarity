import { fetchAllTags, fetchDeletedTags, fetchTopTags } from "@/tauri"
import { queryOptions } from "@tanstack/react-query"

export const allTagsQueryKey = ["tags", "all"]

export const getAllTagsQueryOption = () =>
  queryOptions({
    queryKey: allTagsQueryKey,
    queryFn: () => fetchAllTags(),
    staleTime: 1000 * 60 * 5
  })

export const inactiveTagQueryKey = ["tags", "inactive"]

export const getInactiveTagsQueryOption = () =>
  queryOptions({
    queryKey: inactiveTagQueryKey,
    queryFn: () => fetchDeletedTags(),
    staleTime: 1000 * 60 * 5
  })

export const topTagsQueryKey = ["tags", "top"]

export const getTopQueryOptions = () =>
  queryOptions({
    queryKey: topTagsQueryKey,
    queryFn: () => fetchTopTags(),
    staleTime: 1000 * 60 * 5
  })
