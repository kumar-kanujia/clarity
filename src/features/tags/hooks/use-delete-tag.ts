import { softDeleteTag } from "@/services/tauri"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  allTagsQueryKey,
  attachedTagsQueryKey,
  availableTagsQueryKey,
  topTagsQueryKey
} from "."

export const useSoftDeleteTag = () => {
  const qc = useQueryClient()

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (tagId: number) => softDeleteTag({ tagId }),
    onSuccess: () => {
      return Promise.all([
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
