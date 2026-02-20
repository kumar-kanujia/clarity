import { toggleTag } from "@/services/tauri"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useToggleTag = () => {
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
        qc.invalidateQueries({ queryKey: ["attached-tags"] }),
        qc.invalidateQueries({ queryKey: ["available-tags"] }),
        qc.invalidateQueries({ queryKey: ["tags"] }),
        qc.invalidateQueries({ queryKey: ["top-tags"] })
      ])
    }
  })

  return { mutate, isSuccess, isPending }
}
