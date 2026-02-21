import { useMutation, useQueryClient } from "@tanstack/react-query"

import { softDeleteImage, undoSoftDeleteImage } from "@/services/tauri"

export const useMoveToBin = (imageId: number) => {
  const qc = useQueryClient()
  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async () => softDeleteImage({ imageId }),
    onSuccess: async () => {
      await qc.invalidateQueries()
    }
  })
  return { mutate, isPending, isSuccess, isError }
}

export const useUndoMoveToBin = (imageId: number) => {
  const qc = useQueryClient()

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async () => undoSoftDeleteImage({ imageId }),
    onSuccess: async () => {
      await qc.invalidateQueries()
    }
  })
  return { mutate, isPending, isSuccess, isError }
}
