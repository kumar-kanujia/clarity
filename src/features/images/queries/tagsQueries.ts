import { attachedTags, availableTags } from "@/tauri"
import { queryOptions } from "@tanstack/react-query"

export const attachedTagsQueryKey = ["tags", "attached"]

export const getAttachedTagsQueryOptions = (imageId: number, limit: number) =>
  queryOptions({
    queryKey: [...attachedTagsQueryKey, imageId],
    queryFn: () => attachedTags({ imageId, limit }),
    staleTime: 1000 * 60 * 5
  })

export const availableTagsQueryKey = ["tags", "available"]

export const getAvailableTagsQueryOptions = (imageId: number, limit: number) =>
  queryOptions({
    queryKey: [...availableTagsQueryKey, imageId],
    queryFn: () => availableTags({ imageId, limit }),
    staleTime: 1000 * 60 * 5
  })
