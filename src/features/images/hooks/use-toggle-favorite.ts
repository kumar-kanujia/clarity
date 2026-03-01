import { useMutation, useQueryClient } from "@tanstack/react-query"

import { toggleFavorite } from "@/tauri"

import { allImagesQueryKey, favoritesQueryKey } from "../queries"

type ImageItem = { id: number; isFavorite: boolean; [key: string]: unknown }
type PageData = { data: ImageItem[]; [key: string]: unknown }
type InfiniteQueryData = { pages: PageData[]; pageParams: unknown[] }

export const useToggleFavorite = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationKey: ["toggle-favorite"],
    mutationFn: async ({ imageId }: { imageId: number }) =>
      toggleFavorite({ imageId }),

    onMutate: async ({ imageId }) => {
      await Promise.all([
        qc.cancelQueries({ queryKey: allImagesQueryKey }),
        qc.cancelQueries({ queryKey: favoritesQueryKey })
      ])
      const previousAll = qc.getQueryData<InfiniteQueryData>(allImagesQueryKey)
      const previousFavorites = qc.getQueryData(favoritesQueryKey)

      qc.setQueryData<InfiniteQueryData>(allImagesQueryKey, (oldData) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: page.data.map((item) =>
              item.id === imageId
                ? { ...item, isFavorite: !item.isFavorite }
                : item
            )
          }))
        }
      })

      return { previousAll, previousFavorites }
    },

    onError: (_error, _variables, context) => {
      if (context?.previousAll) {
        qc.setQueryData(allImagesQueryKey, context.previousAll)
      }
      if (context?.previousFavorites) {
        qc.setQueryData(favoritesQueryKey, context.previousFavorites)
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: allImagesQueryKey })
      qc.invalidateQueries({ queryKey: favoritesQueryKey })
    }
  })
}
