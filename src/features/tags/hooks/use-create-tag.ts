import { createTag, type CreateTagParams } from "@/services/tauri"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useCreateTag = () => {
  const qc = useQueryClient()
  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async (params: CreateTagParams) => createTag(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tags"] })
    }
  })

  return { mutate, isPending, isSuccess, isError }
}
