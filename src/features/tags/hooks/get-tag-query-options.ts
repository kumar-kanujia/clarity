import {
  fetchAllTags,
  fetchAttachedTags,
  fetchAvailableTags,
  fetchTagGallery,
  fetchTopTags,
  type CreatedAtCursor
} from "@/services/tauri"
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query"

// 1. Tag Gallery (Infinite Scroll)
export const tagQueryKey = ["tags", "gallery"]

export const getTagGalleryQueryOptions = (tagId: number) =>
  infiniteQueryOptions({
    queryKey: [...tagQueryKey, tagId],
    queryFn: ({ pageParam }) =>
      fetchTagGallery({ tagId, cursor: pageParam ?? undefined }),
    initialPageParam: null as CreatedAtCursor | null,
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null
  })

// 2. All Tags
// Changed from ["tags"] to prevent accidental fuzzy-matching invalidations
export const allTagsQueryKey = ["tags", "all"]

export const getAllTagsQueryOption = () =>
  queryOptions({
    queryKey: allTagsQueryKey,
    queryFn: () => fetchAllTags(),
    // Global tags rarely change, cache them for 5 minutes
    staleTime: 1000 * 60 * 5
  })

// 3. Top Tags
export const topTagsQueryKey = ["tags", "top"]

export const getTopQueryOptions = () =>
  queryOptions({
    queryKey: topTagsQueryKey,
    queryFn: () => fetchTopTags(),
    staleTime: 1000 * 60 * 5
  })

// 4. Attached Tags (Context Menu)
export const attachedTagsQueryKey = ["tags", "attached"]

export const getAttachedTagsQueryOptions = (imageId: number, limit: number) =>
  queryOptions({
    queryKey: [...attachedTagsQueryKey, imageId],
    queryFn: () => fetchAttachedTags({ imageId, limit }),
    // Since our toggle mutation updates the cache directly, we can safely rely
    // on the cache instead of refetching every single time the menu opens
    staleTime: 1000 * 60 * 5
  })

// 5. Available Tags (Context Menu)
export const availableTagsQueryKey = ["tags", "available"]

export const getAvailableTagsQueryOptions = (imageId: number, limit: number) =>
  queryOptions({
    queryKey: [...availableTagsQueryKey, imageId],
    queryFn: () => fetchAvailableTags({ imageId, limit }),
    staleTime: 1000 * 60 * 5
  })
