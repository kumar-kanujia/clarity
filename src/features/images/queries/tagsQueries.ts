import {
  attachedTags,
  attachedTagsMultiple,
  availableTags,
  availableTagsMultiple
} from "@/tauri"
import { queryOptions } from "@tanstack/react-query"

export const attachedTagsQueryKey = ["tags", "attached"] as const
export const availableTagsQueryKey = ["tags", "available"] as const

export const getAttachedTagsQueryOptions = (imageId: number, limit: number) =>
  queryOptions({
    queryKey: [...attachedTagsQueryKey, imageId],
    queryFn: () => attachedTags({ imageId, limit }),
    staleTime: 1000 * 60 * 5
  })

export const getAvailableTagsQueryOptions = (imageId: number, limit: number) =>
  queryOptions({
    queryKey: [...availableTagsQueryKey, imageId],
    queryFn: () => availableTags({ imageId, limit }),
    staleTime: 1000 * 60 * 5
  })

export const getAttachedTagsQueryOptionsMultiple = (
  imageIds: number[],
  limit: number
) =>
  queryOptions({
    queryKey: [...attachedTagsQueryKey, imageIds],
    queryFn: () => attachedTagsMultiple({ imageIds, limit }),
    staleTime: 1000 * 60 * 5
  })

export const getAvailableTagsQueryOptionsMultiple = (
  imageIds: number[],
  limit: number
) =>
  queryOptions({
    queryKey: [...availableTagsQueryKey, imageIds],
    queryFn: () => availableTagsMultiple({ imageIds, limit }),
    staleTime: 1000 * 60 * 5
  })
