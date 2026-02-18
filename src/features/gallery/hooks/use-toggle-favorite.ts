import { toggleFavorite } from "@/services/tauri"

export const useToggleFavorite = (imageId: number) => {
  return async () => {
    const isFavorite = await toggleFavorite({ imageId })
    return isFavorite
  }
}
