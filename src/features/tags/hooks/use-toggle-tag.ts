import { useMutation, useQueryClient } from "@tanstack/react-query"

import { toggleTag } from "@/services/tauri"
import {
  allTagsQueryKey,
  attachedTagsQueryKey,
  availableTagsQueryKey
} from "./use-tag-query-options"

export const useToggleTag = (imageId: number) => {
  const qc = useQueryClient()
  const { mutate, isSuccess, isPending } = useMutation({
    mutationFn: async ({
      imageId,
      tagId
    }: {
      imageId: number
      tagId: number
    }) => {
      let res = await toggleTag({ imageId, tagId })
      return res
    },
    onSuccess: async () => {
      Promise.all([
        qc.invalidateQueries({ queryKey: [attachedTagsQueryKey, imageId] }),
        qc.invalidateQueries({ queryKey: [availableTagsQueryKey, imageId] }),
        qc.invalidateQueries({ queryKey: allTagsQueryKey })
      ])
    }
  })

  return { mutate, isSuccess, isPending }
}
