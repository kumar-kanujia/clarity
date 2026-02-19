import { useInfiniteQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useRef, useState } from "react"
import { ImageCard } from "./image-card"
import { type ImageItemResult } from "@/services/tauri"
import type { AnyInfiniteQueryOptions } from "@/types"
import { ImageLightbox } from "@/components/layout/image-grid/image-lightbox"
import { AnimatePresence, motion } from "motion/react"

interface ImageGridProps<T extends AnyInfiniteQueryOptions> {
  queryOptions: T
  inBinView?: boolean
}

export function ImageGrid<T extends AnyInfiniteQueryOptions>({
  queryOptions,
  inBinView
}: ImageGridProps<T>) {
  const loaderRef = useRef<HTMLDivElement>(null)
  const imageRefs = useRef<Array<HTMLDivElement | null>>([])

  const [index, setIndex] = useState(0)
  const [isViewBoxOpen, setIsViewBoxOpen] = useState(false)

  const { data, fetchNextPage, isLoading, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<ImageItemResult>(queryOptions)

  const onImageClick = (index: number) => {
    setIndex(index)
    setIsViewBoxOpen(true)
  }

  const onViewBoxClose = () => {
    setIsViewBoxOpen(false)

    requestAnimationFrame(() => {
      const el = imageRefs.current[index]

      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center"
        })
      }
    })
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoading &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          fetchNextPage()
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [isLoading, hasNextPage, loaderRef, fetchNextPage, isFetchingNextPage])

  const images = useMemo(
    () => data?.pages.flatMap((page) => page.data) || [],
    [data]
  )

  let nearingEnd = index + 4 >= images.length

  useEffect(() => {
    if (isViewBoxOpen) {
      if (nearingEnd && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }
  }, [
    isViewBoxOpen,
    nearingEnd,
    images.length,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  ])

  return (
    <div className="relative">
      {/* Grid */}
      <motion.div
        animate={{
          opacity: isViewBoxOpen ? 0 : 1,
          scale: isViewBoxOpen ? 0.98 : 1
        }}
        transition={{
          duration: 0.2,
          ease: "easeOut"
        }}
        style={{
          pointerEvents: isViewBoxOpen ? "none" : "auto"
        }}
        className="py-4"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              ref={(el) => {
                imageRefs.current[index] = el
              }}
            >
              <ImageCard
                image={image}
                index={index}
                onClick={() => onImageClick(index)}
                inBinView={inBinView}
              />
            </div>
          ))}
        </div>

        <div ref={loaderRef} className="h-20 w-full" />
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {isViewBoxOpen && (
          <ImageLightbox
            data={images}
            index={index}
            setIndex={setIndex}
            onClick={onViewBoxClose}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
