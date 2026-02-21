import { toggleFavorite } from "@/services/tauri"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { favoriteQueryKey } from "./get-favorites-query-options"

export const useToggleFavorite = (imageId: number) => {
  const qc = useQueryClient()

  const { mutate, data, isPending, isSuccess, isError } = useMutation({
    mutationKey: [imageId],
    mutationFn: async () => toggleFavorite({ imageId }),
    onSuccess: async () =>
      await Promise.all([
        qc.invalidateQueries({ queryKey: favoriteQueryKey }),
        qc.invalidateQueries({ queryKey: favoriteQueryKey })
      ])
  })

  return { mutate, data, isPending, isSuccess, isError }
}
