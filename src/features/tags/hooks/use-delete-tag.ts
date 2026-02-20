import { softDeleteTag } from "@/services/tauri"
import { useMutation } from "@tanstack/react-query"

export const useSoftDeleteTag = () => {
  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: async (tagId: number) => {
      softDeleteTag({ tagId })
    }
  })

  return {
    mutate,
    isPending,
    isError,
    isSuccess
  }
}
