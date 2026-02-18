import { ImageGrid } from "@/components/layout/image-grid"
import { useGalleryQueryOptions } from "../hooks"

export const GalleryView = () => {
  const { queryOption } = useGalleryQueryOptions()
  return <ImageGrid queryOptions={queryOption} />
}
