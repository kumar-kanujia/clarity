import { useMutation, useQueryClient } from "@tanstack/react-query"

import { softDeleteImage, undoSoftDeleteImage } from "@/tauri"

import { allImagesQueryKey, trashQueryKey } from "../queries"

export const useMoveToTrash = () => {
  const qc = useQueryClient()

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async ({ imageId }: { imageId: number }) =>
      softDeleteImage({ imageId }),
    onMutate: async ({ imageId }) => {
      await qc.cancelQueries({ queryKey: allImagesQueryKey })

      const previousImages = qc.getQueryData(allImagesQueryKey)

      qc.setQueryData(allImagesQueryKey, (oldData: any) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.filter((item: any) => item.id !== imageId)
          }))
        }
      })

      return { previousImages }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousImages) {
        qc.setQueryData(allImagesQueryKey, context.previousImages)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: trashQueryKey })
    }
  })

  return { mutate, isPending, isSuccess, isError }
}

export const useUndoMoveToTrash = () => {
  const qc = useQueryClient()

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async ({ imageId }: { imageId: number }) =>
      undoSoftDeleteImage({ imageId }),
    onMutate: async ({ imageId }) => {
      await qc.cancelQueries({ queryKey: trashQueryKey })

      const previousImages = qc.getQueryData(trashQueryKey)

      qc.setQueryData(trashQueryKey, (oldData: any) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.filter((item: any) => item.id !== imageId)
          }))
        }
      })

      return { previousImages }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousImages) {
        qc.setQueryData(trashQueryKey, context.previousImages)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: allImagesQueryKey })
    }
  })

  return { mutate, isPending, isSuccess, isError }
}
