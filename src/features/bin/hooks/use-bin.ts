import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  emptyBin,
  softDeleteImage,
  undoSoftDeleteImage
} from "@/services/tauri"

import { galleryQueryKey } from "@/features/gallery/hooks"
import { binQueryKey } from "."

export const useMoveToBin = (imageId: number) => {
  const qc = useQueryClient()

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async () => softDeleteImage({ imageId }),
    onMutate: async () => {
      // 1. Cancel outgoing fetches for the gallery
      await qc.cancelQueries({ queryKey: galleryQueryKey })

      // 2. Snapshot the previous state
      const previousGallery = qc.getQueryData(galleryQueryKey)

      // 3. Optimistically REMOVE the image from the gallery UI instantly
      qc.setQueryData(galleryQueryKey, (oldData: any) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.filter((item: any) => item.id !== imageId)
          }))
        }
      })

      return { previousGallery }
    },
    onError: (_err, _variables, context) => {
      // Rollback if the Tauri command fails
      if (context?.previousGallery) {
        qc.setQueryData(galleryQueryKey, context.previousGallery)
      }
    },
    onSettled: () => {
      // Quietly invalidate the bin list in the background so it's fresh
      // when the user navigates there. Do NOT invalidate the gallery!
      qc.invalidateQueries({ queryKey: binQueryKey })
    }
  })

  return { mutate, isPending, isSuccess, isError }
}

export const useUndoMoveToBin = (imageId: number) => {
  const qc = useQueryClient()

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async () => undoSoftDeleteImage({ imageId }),
    onMutate: async () => {
      // 1. Cancel outgoing fetches for the bin
      await qc.cancelQueries({ queryKey: binQueryKey })

      // 2. Snapshot the previous state
      const previousBin = qc.getQueryData(binQueryKey)

      // 3. Optimistically REMOVE the image from the bin UI instantly
      qc.setQueryData(binQueryKey, (oldData: any) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.filter((item: any) => item.id !== imageId)
          }))
        }
      })

      return { previousBin }
    },
    onError: (_err, _variables, context) => {
      // Rollback if the Tauri command fails
      if (context?.previousBin) {
        qc.setQueryData(binQueryKey, context.previousBin)
      }
    },
    onSettled: () => {
      // Quietly invalidate the gallery in the background so the restored
      // image appears the next time they look at the main grid.
      qc.invalidateQueries({ queryKey: galleryQueryKey })
    }
  })

  return { mutate, isPending, isSuccess, isError }
}

export const useEmptyBin = () => {
  const qc = useQueryClient()

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async () => emptyBin(),
    onMutate: async () => {
      // 1. Cancel outgoing fetches for the gallery
      await qc.cancelQueries({ queryKey: binQueryKey })

      // 2. Snapshot the previous state
      const prevBinGallery = qc.getQueryData(binQueryKey)

      // 3. Optimistically REMOVE the image from the gallery UI instantly
      qc.setQueryData(binQueryKey, {
        pages: [{ data: [], nextCursor: null }],
        pageParams: [null]
      })

      return { prevBinGallery }
    },
    onError: (_err, _variables, context) => {
      // Rollback if the Tauri command fails
      if (context?.prevBinGallery) {
        qc.setQueryData(binQueryKey, context.prevBinGallery)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: binQueryKey })
    }
  })

  return { mutate, isPending, isSuccess, isError }
}
