import { useMutation, useQueryClient } from "@tanstack/react-query"

import { toggleFavorite } from "@/services/tauri"

import { favoriteQueryKey } from "./get-favorites-query-options"
import { galleryQueryKey } from "@/features/gallery/hooks"

export const useToggleFavorite = (imageId: number) => {
  const qc = useQueryClient()
  const { mutate, data, isPending, isSuccess, isError } = useMutation({
    mutationKey: [imageId],
    mutationFn: async () => toggleFavorite({ imageId }),
    onSuccess: async () =>
      await Promise.all([
        qc.invalidateQueries({ queryKey: favoriteQueryKey }),
        qc.invalidateQueries({ queryKey: galleryQueryKey })
      ])
  })

  return { mutate, data, isPending, isSuccess, isError }
}
