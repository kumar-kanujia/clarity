import { editTag, type EditTagParams } from "@/services/tauri"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  allTagsQueryKey,
  attachedTagsQueryKey,
  availableTagsQueryKey,
  topTagsQueryKey
} from "./use-user-tag-query"

export const useEditTag = () => {
  const qc = useQueryClient()
  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: async ({ tagId, tagColor, tagName }: EditTagParams) => {
      await editTag({ tagId, tagColor, tagName })
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: allTagsQueryKey }),
        qc.invalidateQueries({ queryKey: topTagsQueryKey }),
        qc.invalidateQueries({ queryKey: attachedTagsQueryKey }),
        qc.invalidateQueries({ queryKey: availableTagsQueryKey })
      ])
    }
  })

  return {
    mutate,
    isPending,
    isError,
    isSuccess
  }
}
