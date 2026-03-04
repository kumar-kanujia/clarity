import { useMutation, useQueryClient } from "@tanstack/react-query"

import { toggleFavorite } from "@/tauri"

import { allImagesQueryKey, favoritesQueryKey } from "../queries"

type ImageItem = { id: number; isFavorite: boolean; [key: string]: unknown }
type PageData = { data: ImageItem[]; [key: string]: unknown }
type InfiniteQueryData = { pages: PageData[]; pageParams: unknown[] }

const toggleImageFavorite =
  (imageId: number) => (oldData: InfiniteQueryData | undefined) => {
    if (!oldData) return oldData
    return {
      ...oldData,
      pages: oldData.pages.map((page) => ({
        ...page,
        data: page.data.map((item) =>
          item.id === imageId ? { ...item, isFavorite: !item.isFavorite } : item
        )
      }))
    }
  }

const imageQueryKeys = [allImagesQueryKey, favoritesQueryKey]

export const useToggleFavorite = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationKey: ["toggle-favorite"],
    mutationFn: ({ imageId }: { imageId: number }) =>
      toggleFavorite({ imageId }),
    onMutate: async ({ imageId }) => {
      await Promise.all(
        imageQueryKeys.map((queryKey) => qc.cancelQueries({ queryKey }))
      )

      const previousAll = qc.getQueryData<InfiniteQueryData>(allImagesQueryKey)
      const previousFavorites =
        qc.getQueryData<InfiniteQueryData>(favoritesQueryKey)

      qc.setQueryData<InfiniteQueryData>(
        allImagesQueryKey,
        toggleImageFavorite(imageId)
      )

      return { previousAll, previousFavorites }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousAll)
        qc.setQueryData(allImagesQueryKey, context.previousAll)
      if (context?.previousFavorites)
        qc.setQueryData(favoritesQueryKey, context.previousFavorites)
    },
    onSettled: () => {
      imageQueryKeys.forEach((queryKey) => qc.invalidateQueries({ queryKey }))
    }
  })
}
