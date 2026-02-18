import { markImageDeleted } from "@/services/tauri"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useMoveToBin = (imageId: number) => {
  const queryClient = useQueryClient()

  const { mutate, isSuccess } = useMutation({
    mutationFn: async () => markImageDeleted({ imageId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] })
    }
  })

  return { moveToBin: mutate, isDeleted: isSuccess }
}
