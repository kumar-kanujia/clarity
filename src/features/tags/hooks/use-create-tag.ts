import { createTag, type CreateTagParams } from "@/services/tauri"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  allTagsQueryKey,
  attachedTagsQueryKey,
  availableTagsQueryKey,
  topTagsQueryKey
} from "./use-user-tag-query"

export const useCreateTag = () => {
  const qc = useQueryClient()
  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async (params: CreateTagParams) => createTag(params),
    onSuccess: () => {
      Promise.all([
        qc.invalidateQueries({ queryKey: allTagsQueryKey }),
        qc.invalidateQueries({ queryKey: topTagsQueryKey }),
        qc.invalidateQueries({ queryKey: attachedTagsQueryKey }),
        qc.invalidateQueries({ queryKey: availableTagsQueryKey })
      ])
    }
  })

  return { mutate, isPending, isSuccess, isError }
}
