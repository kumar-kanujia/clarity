import {
  fetchAllTags,
  fetchAttachedTags,
  fetchAvailableTags,
  fetchTopTags
} from "@/services/tauri"
import { queryOptions } from "@tanstack/react-query"

const allTagsQueryKey = "tags"

export const useGetAllTags = () => {
  const option = queryOptions({
    queryKey: [allTagsQueryKey],
    queryFn: async () => {
      return await fetchAllTags()
    }
  })

  return { queryKey: allTagsQueryKey, queryOption: option }
}

const topTagsQueryKey = "top-tags"

export const useGetTopTags = () => {
  const option = queryOptions({
    queryKey: [topTagsQueryKey],
    queryFn: async () => {
      const tags = await fetchTopTags()
      return tags.slice(0, 5)
    }
  })

  return { queryKey: topTagsQueryKey, queryOption: option }
}

export const useGetAttachedTags = (imageId: number, limit: number) => {
  const option = queryOptions({
    queryKey: ["attached-tags", imageId],
    queryFn: async () => {
      return await fetchAttachedTags({ imageId, limit })
    }
  })

  return { queryKey: "attached-tags", queryOption: option }
}

export const useGetAvilableTags = (imageId: number, limit: number) => {
  const option = queryOptions({
    queryKey: ["available-tags", imageId],
    queryFn: async () => {
      return await fetchAvailableTags({ imageId, limit })
    }
  })

  return { queryKey: "attached-tags", queryOption: option }
}
