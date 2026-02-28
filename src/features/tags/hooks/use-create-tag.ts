import { createTag, type CreateTagParams } from "@/tauri"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { allTagsQueryKey, topTagsQueryKey } from "../queries"

export const useCreateTag = () => {
  const qc = useQueryClient()

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async (params: CreateTagParams) => await createTag(params),

    onSuccess: () => {
      return Promise.all([
        qc.invalidateQueries({ queryKey: allTagsQueryKey }),
        qc.invalidateQueries({ queryKey: topTagsQueryKey })
      ])
    }
  })

  return { mutate, isPending, isSuccess, isError }
}
