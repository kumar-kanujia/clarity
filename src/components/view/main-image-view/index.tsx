import { useSuspenseInfiniteQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "motion/react"

import type { ImageItemResult } from "@/services/tauri"

import type {
  AnyInfiniteQueryOptions,
  AnySuspenseInfiniteQueryOptions
} from "@/types"

import { useLoadObserver } from "@/hooks/use-load-observer"

import {
  EndBanner,
  EmptyState,
  ErrorBanner,
  ErrorState,
  LoadingBanner
} from "@/components/common"

import { ImageOptions } from "./image-options"
import { ImageCard } from "./image-card"
import { ImageLightbox } from "./image-lightbox"

interface MainImageViewProps<T extends AnyInfiniteQueryOptions> {
  queryOptions: T
}

export const MainImageView = <T extends AnySuspenseInfiniteQueryOptions>({
  queryOptions
}: MainImageViewProps<T>) => {
  const [index, setIndex] = useState(0)
  const [isViewBoxOpen, setIsViewBoxOpen] = useState(false)
  const imageRefs = useRef<Array<HTMLDivElement | null>>([])

  const {
    data,
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetching,
    status,
    isFetchingNextPage,
    isError,
    isFetchNextPageError
  } = useSuspenseInfiniteQuery<ImageItemResult>(queryOptions)

  const loaderRef = useLoadObserver({
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage
  })

  useEffect(() => {
    if (imageRefs.current.length > 0) {
      requestAnimationFrame(() => {
        imageRefs.current[1]?.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        })
      })
    }
  }, [])

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
          block: "nearest"
        })
      }
    })
  }

  const showEnd =
    status === "success" &&
    !hasNextPage &&
    !isFetching &&
    !isFetchingNextPage &&
    images.length > 0

  const showEmpty = status === "success" && images.length === 0

  if (showEmpty) {
    return <EmptyState />
  }

  if (isError && images.length === 0) {
    return <ErrorState />
  }

  return (
    <>
      <div className="relative select-none">
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
                <ImageOptions imageId={image.id}>
                  <ImageCard
                    image={image}
                    index={index}
                    onClick={() => onImageClick(index)}
                  />
                </ImageOptions>
              </div>
            ))}
          </div>
        </motion.div>
        {isViewBoxOpen && (
          <ImageLightbox
            data={images}
            index={index}
            setIndex={setIndex}
            onClose={onViewBoxClose}
          />
        )}
      </div>
      {isLoading && <LoadingBanner />}
      {showEnd && <EndBanner />}
      {isFetchNextPageError && <ErrorBanner />}
      <div ref={loaderRef} className="h-20 w-full" />
    </>
  )
}
