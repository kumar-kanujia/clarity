import { useMutation, useQueryClient } from "@tanstack/react-query"

import { toggleFavorite } from "@/tauri"

import { allImagesQueryKey, favoritesQueryKey } from "../queries"

export const useToggleFavorite = () => {
  const qc = useQueryClient()

  const { mutate, data, isPending, isSuccess, isError } = useMutation({
    mutationKey: ["toggle-favorite"],
    mutationFn: async ({ imageId }: { imageId: number }) =>
      toggleFavorite({ imageId }),

    onMutate: async ({ imageId }) => {
      await Promise.all([
        qc.cancelQueries({ queryKey: allImagesQueryKey }),
        qc.cancelQueries({ queryKey: favoritesQueryKey })
      ])
      const previousAll = qc.getQueryData(allImagesQueryKey)
      const previousFavorites = qc.getQueryData(favoritesQueryKey)

      qc.setQueryData(allImagesQueryKey, (oldData: any) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((item: any) =>
              item.id === imageId
                ? { ...item, isFavorite: !item.isFavorite }
                : item
            )
          }))
        }
      })

      return { previousAll, previousFavorites }
    },

    onError: (_T, _Y, context) => {
      if (context?.previousAll) {
        qc.setQueryData(allImagesQueryKey, context.previousAll)
      }
      if (context?.previousFavorites) {
        qc.setQueryData(favoritesQueryKey, context.previousFavorites)
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: favoritesQueryKey })
    }
  })

  return { mutate, data, isPending, isSuccess, isError }
}
