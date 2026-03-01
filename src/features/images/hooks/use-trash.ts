import {
  useMutation,
  useQueryClient,
  type QueryKey
} from "@tanstack/react-query"

import { allImagesQueryKey, trashQueryKey } from "../queries"

import {
  deleteFromTrash,
  emptyTrash,
  moveToTrash,
  restoreFromTrash
} from "@/tauri"

const filterPaginatedImages = (oldData: any, imageIds: number[]) => {
  if (!oldData) return oldData
  return {
    ...oldData,
    pages: oldData.pages.map((page: any) => ({
      ...page,
      data: page.data.filter((item: any) => !imageIds.includes(item.id))
    }))
  }
}

const useOptimisticImageMutation = ({
  mutationFn,
  optimisticQueryKey,
  invalidateQueryKey
}: {
  mutationFn: (imageIds: number[]) => Promise<unknown>
  optimisticQueryKey: QueryKey
  invalidateQueryKey: QueryKey
}) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ imageIds }: { imageIds: number[] }) => mutationFn(imageIds),
    onMutate: async ({ imageIds }) => {
      await qc.cancelQueries({ queryKey: optimisticQueryKey })
      const previousImages = qc.getQueryData(optimisticQueryKey)
      qc.setQueryData(optimisticQueryKey, (oldData: any) =>
        filterPaginatedImages(oldData, imageIds)
      )
      return { previousImages }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousImages) {
        qc.setQueryData(optimisticQueryKey, context.previousImages)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: invalidateQueryKey })
    }
  })
}

export const useMoveToTrash = () =>
  useOptimisticImageMutation({
    mutationFn: (imageIds) => moveToTrash({ imageIds }),
    optimisticQueryKey: allImagesQueryKey,
    invalidateQueryKey: trashQueryKey
  })

export const useUndoMoveToTrash = () =>
  useOptimisticImageMutation({
    mutationFn: (imageIds) => restoreFromTrash({ imageIds }),
    optimisticQueryKey: trashQueryKey,
    invalidateQueryKey: allImagesQueryKey
  })

export const useDeleteFromTrash = () =>
  useOptimisticImageMutation({
    mutationFn: (imageIds) => deleteFromTrash({ imageIds }),
    optimisticQueryKey: trashQueryKey,
    invalidateQueryKey: trashQueryKey
  })

const EMPTY_TRASH_STATE = {
  pages: [{ data: [], nextCursor: null }],
  pageParams: [null]
}

export const useEmptyTrash = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: emptyTrash,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: trashQueryKey })
      const prevBinGallery = qc.getQueryData(trashQueryKey)
      qc.setQueryData(trashQueryKey, EMPTY_TRASH_STATE)
      return { prevBinGallery }
    },
    onError: (_err, _variables, context) => {
      if (context?.prevBinGallery) {
        qc.setQueryData(trashQueryKey, context.prevBinGallery)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: trashQueryKey })
    }
  })
}
