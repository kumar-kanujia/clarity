import {
  fetchAllTags,
  fetchAttachedTags,
  fetchAvailableTags,
  fetchTopTags
} from "@/services/tauri"
import { queryOptions } from "@tanstack/react-query"

export const allTagsQueryKey = ["tags"]

export const getAllTagsQueryOption = () =>
  queryOptions({
    queryKey: allTagsQueryKey,
    queryFn: async () => {
      return await fetchAllTags()
    }
  })

export const topTagsQueryKey = ["top-tags"]

export const getTopQueryOptions = () =>
  queryOptions({
    queryKey: topTagsQueryKey,
    queryFn: async () => {
      const tags = await fetchTopTags()
      return tags
    }
  })

export const attachedTagsQueryKey = ["tags", "attached-tags"]

export const getAttachedTagsQueryOptions = (imageId: number, limit: number) => {
  return queryOptions({
    queryKey: [...attachedTagsQueryKey, imageId],
    queryFn: async () => {
      return await fetchAttachedTags({ imageId, limit })
    }
  })
}

export const availableTagsQueryKey = ["tags", "available-tags"]

export const getAvailableTagsQueryOptions = (
  imageId: number,
  limit: number
) => {
  return queryOptions({
    queryKey: [...availableTagsQueryKey, imageId],
    queryFn: async () => {
      return await fetchAvailableTags({ imageId, limit })
    }
  })
}
