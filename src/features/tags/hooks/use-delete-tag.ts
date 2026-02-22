import { softDeleteTag } from "@/services/tauri"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useSoftDeleteTag = () => {
  const qc = useQueryClient()
  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: async (tagId: number) => {
      softDeleteTag({ tagId })
    },
    onSuccess: () => {
      qc.invalidateQueries()
    }
  })

  return {
    mutate,
    isPending,
    isError,
    isSuccess
  }
}
