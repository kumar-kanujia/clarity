import { fetchAllTags, fetchTopTags } from "@/services/tauri"
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
