import { fetchActiveTags, fetchInactiveTags, fetchTopTags } from "@/tauri"
import { queryOptions } from "@tanstack/react-query"

export const allTagsQueryKey = ["tags", "active"]

export const getAllTagsQueryOption = () =>
  queryOptions({
    queryKey: allTagsQueryKey,
    queryFn: () => fetchActiveTags(),
    staleTime: 1000 * 60 * 5
  })

export const inactiveTagQueryKey = ["tags", "inactive"]

export const getInactiveTagsQueryOption = () =>
  queryOptions({
    queryKey: inactiveTagQueryKey,
    queryFn: () => fetchInactiveTags(),
    staleTime: 1000 * 60 * 5
  })

export const topTagsQueryKey = ["tags", "top"]

export const getTopQueryOptions = () =>
  queryOptions({
    queryKey: topTagsQueryKey,
    queryFn: () => fetchTopTags(),
    staleTime: 1000 * 60 * 5
  })
