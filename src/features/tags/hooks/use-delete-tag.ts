import { softDeleteTag, undoDeleteTag } from "@/services/tauri"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  allTagsQueryKey,
  attachedTagsQueryKey,
  availableTagsQueryKey,
  inactiveTagQueryKey,
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
        qc.invalidateQueries({ queryKey: availableTagsQueryKey }),
        qc.invalidateQueries({ queryKey: inactiveTagQueryKey })
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

export const useRestoreTag = () => {
  const qc = useQueryClient()
  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (tagId: number) => undoDeleteTag({ tagId }),
    onSuccess: () => {
      return Promise.all([
        qc.invalidateQueries({ queryKey: allTagsQueryKey }),
        qc.invalidateQueries({ queryKey: topTagsQueryKey }),
        qc.invalidateQueries({ queryKey: attachedTagsQueryKey }),
        qc.invalidateQueries({ queryKey: availableTagsQueryKey }),
        qc.invalidateQueries({ queryKey: inactiveTagQueryKey })
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
