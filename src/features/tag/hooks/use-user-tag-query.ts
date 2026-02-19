import { fetchAllTags } from "@/services/tauri"
import { queryOptions } from "@tanstack/react-query"

export const allTagsQueryKey = "tags"

export const useGetAllTags = () => {
  const option = queryOptions({
    queryKey: [allTagsQueryKey],
    queryFn: async () => {
      return await fetchAllTags()
    }
  })

  return { queryKey: allTagsQueryKey, queryOption: option }
}
