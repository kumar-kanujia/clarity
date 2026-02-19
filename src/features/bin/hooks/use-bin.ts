import { softDeleteImage, undoSoftDeleteImage } from "@/services/tauri"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useMoveToBin = (imageId: number) => {
  const qc = useQueryClient()

  const { mutate, data, isPending, isSuccess, isError } = useMutation({
    mutationFn: async () => softDeleteImage({ imageId }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["all"] })
    }
  })

  return { mutate, data, isPending, isSuccess, isError }
}

export const useUndoMoveToBin = (imageId: number) => {
  const qc = useQueryClient()

  const { mutate, data, isPending, isSuccess, isError } = useMutation({
    mutationFn: async () => undoSoftDeleteImage({ imageId }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["all"] })
    }
  })

  return { mutate, data, isPending, isSuccess, isError }
}
