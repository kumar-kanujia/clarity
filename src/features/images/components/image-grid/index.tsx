import { useVirtualizer } from "@tanstack/react-virtual"
import { useEffect, useRef, type ReactNode } from "react"

import type { ImageItem } from "@/tauri"

import { useContainerCols } from "@/features/images/hooks"

import { ImageCard } from "./image-card"
import { ImageOptions } from "./image-options"

interface ImageGridProps {
  images: ImageItem[]
  fetchMore: () => void
  hasMore: boolean
  children?: ReactNode
  hideOptions?: boolean
  renderImageAction?: (image: ImageItem) => ReactNode
}

export const ImageGrid = ({
  images,
  fetchMore,
  hasMore,
  children,
  renderImageAction,
  hideOptions
}: ImageGridProps) => {
  const parentRef = useRef<HTMLDivElement>(null)
  const cols = useContainerCols(parentRef)
  const rowCount = Math.ceil(images.length / cols)

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300,
    overscan: 3
  })

  const virtualItems = virtualizer.getVirtualItems()
  const lastItem = virtualItems[virtualItems.length - 1]

  useEffect(() => {
    if (lastItem && lastItem.index >= rowCount - 1 && hasMore) {
      fetchMore()
    }
  }, [lastItem, rowCount, hasMore, fetchMore])

  return (
    <div ref={parentRef} className="size-full overflow-y-scroll py-4">
      <div
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualItems.map((virtualRow) => {
          const startIndex = virtualRow.index * cols

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className="absolute top-0 left-0 w-full"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              <div
                className="grid gap-x-6 px-2 pb-6"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
                }}
              >
                {images.slice(startIndex, startIndex + cols).map((image, i) => (
                  <ImageOptions
                    key={image.id}
                    imageId={image.id}
                    hidden={hideOptions}
                  >
                    <ImageCard image={image} index={startIndex + i}>
                      {renderImageAction?.(image)}
                    </ImageCard>
                  </ImageOptions>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      {children}
    </div>
  )
}
