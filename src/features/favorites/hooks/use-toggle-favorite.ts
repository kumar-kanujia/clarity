import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toggleFavorite } from "@/services/tauri"
import { favoriteQueryKey } from "./get-favorites-query-options"
import { galleryQueryKey } from "@/features/gallery/hooks"

export const useToggleFavorite = (imageId: number) => {
  const qc = useQueryClient()

  const { mutate, data, isPending, isSuccess, isError } = useMutation({
    mutationKey: ["toggle-favorite", imageId],
    mutationFn: async () => toggleFavorite({ imageId }),

    onMutate: async () => {
      await Promise.all([
        qc.cancelQueries({ queryKey: galleryQueryKey }),
        qc.cancelQueries({ queryKey: favoriteQueryKey })
      ])
      const previousGallery = qc.getQueryData(galleryQueryKey)
      const previousFavorites = qc.getQueryData(favoriteQueryKey)

      qc.setQueryData(galleryQueryKey, (oldData: any) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((item: any) =>
              item.id === imageId
                ? { ...item, isFavorite: !item.isFavorite } // Flip the boolean instantly
                : item
            )
          }))
        }
      })

      return { previousGallery, previousFavorites }
    },

    // 2. ROLLBACK ON ERROR
    onError: (_T, _Y, context) => {
      if (context?.previousGallery) {
        qc.setQueryData(galleryQueryKey, context.previousGallery)
      }
      if (context?.previousFavorites) {
        qc.setQueryData(favoriteQueryKey, context.previousFavorites)
      }
    },

    // 3. BACKGROUND SYNC
    onSettled: () => {
      // We ONLY invalidate the favorites list here, because inserting/removing
      // an entire item from a dedicated favorites grid optimistically is very complex.
      // We DO NOT invalidate the gallery cache, avoiding the massive multi-page refetch!
      qc.invalidateQueries({ queryKey: favoriteQueryKey })
    }
  })

  return { mutate, data, isPending, isSuccess, isError }
}
