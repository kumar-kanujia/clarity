import { useMutation, useQueryClient } from "@tanstack/react-query"

import { toggleTag } from "@/services/tauri"

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
        qc.invalidateQueries({ queryKey: ["tags", "attached-tags", imageId] }),
        qc.invalidateQueries({ queryKey: ["tags", "available-tags", imageId] }),
        qc.invalidateQueries({ queryKey: ["tags"] })
      ])
    }
  })

  return { mutate, isSuccess, isPending }
}
