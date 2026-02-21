import type { ImageItem } from "@/services/tauri"
import { ImageCard } from "./image-card"
import { ImageOptions } from "./image-options"

interface ImageGridProps {
  images: ImageItem[]
}

export const ImageGrid = ({ images }: ImageGridProps) => {
  return (
    <div className="relative select-none">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
        {images.map((image, index) => (
          <ImageOptions id={image.id} key={image.id}>
            <ImageCard image={image} index={index} />
          </ImageOptions>
        ))}
      </div>
    </div>
  )
}
