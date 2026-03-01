import { useVirtualizer } from "@tanstack/react-virtual"
import { useEffect, useRef, type ReactNode } from "react"

import type { ImageItem } from "@/tauri"

import { ImageCard } from "./image-card"

import { useResponsiveCols } from "../../hooks"
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
  const cols = useResponsiveCols()
  const rowCount = Math.ceil(images.length / cols)

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300,
    overscan: 3
  })

  const virtualItems = virtualizer.getVirtualItems()

  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1]
    if (!lastItem) return
    if (lastItem.index >= rowCount - 1 && hasMore) {
      fetchMore()
    }
  }, [virtualItems, rowCount, hasMore, fetchMore])

  return (
    <div
      ref={parentRef}
      className="size-full py-4 overflow-y-scroll ease-in-out duration-75"
    >
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualItems.map((virtualRow) => {
          const startIndex = virtualRow.index * cols
          const rowImages = images.slice(startIndex, startIndex + cols)
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className="absolute top-0 left-0 w-full"
              style={{
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <div
                className="grid gap-x-6 pb-6 px-2"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
                }}
              >
                {rowImages.map((image, i) => {
                  const actualIndex = startIndex + i
                  return (
                    <ImageOptions imageId={image.id} hideOptions={hideOptions}>
                      <ImageCard
                        key={image.id}
                        image={image}
                        index={actualIndex}
                      >
                        {renderImageAction?.(image)}
                      </ImageCard>
                    </ImageOptions>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      {children}
    </div>
  )
}
