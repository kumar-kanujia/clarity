import { ImageGrid } from "@/components/layout/image-grid"
import { useFavoritesQueryOptions } from "../hooks"

export const FavoritesView = () => {
  const { queryOption } = useFavoritesQueryOptions()
  return <ImageGrid queryOptions={queryOption} />
}
