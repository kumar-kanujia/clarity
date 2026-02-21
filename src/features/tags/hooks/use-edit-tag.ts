import { editTag, type EditTagParams } from "@/services/tauri"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useEditTag = () => {
  const qc = useQueryClient()
  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: async ({ tagId, tagColor, tagName }: EditTagParams) => {
      await editTag({ tagId, tagColor, tagName })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tags"] })
    }
  })

  return {
    mutate,
    isPending,
    isError,
    isSuccess
  }
}
