import { useEffect, useMemo, useRef, useState } from "react"
import { useSuspenseInfiniteQuery } from "@tanstack/react-query"
import { motion } from "motion/react"

import type { ImageItemResult } from "@/services/tauri"
import type { AnySuspenseInfiniteQueryOptions } from "@/types"

import { useLoadObserver } from "@/hooks/use-load-observer"

import {
  EndBanner,
  EmptyState,
  ErrorBanner,
  LoadingBanner
} from "@/components/common"

import { ImageOptions } from "./image-options"
import { ImageCard } from "./image-card"
import { ImageLightbox } from "./image-lightbox"
import { useLocation } from "@tanstack/react-router"

interface MainImageViewProps<T extends AnySuspenseInfiniteQueryOptions> {
  queryOptions: T
}

export const MainImageView = <T extends AnySuspenseInfiniteQueryOptions>({
  queryOptions
}: MainImageViewProps<T>) => {
  const [index, setIndex] = useState(0)
  const [isViewBoxOpen, setIsViewBoxOpen] = useState(false)
  const imageRefs = useRef<Array<HTMLDivElement | null>>([])

  const { pathname } = useLocation()

  let isBinView = useMemo(() => pathname === "/bin", [pathname])

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError
  } = useSuspenseInfiniteQuery<ImageItemResult>(queryOptions)

  const loaderRef = useLoadObserver({
    fetchNextPage,
    isLoading: false,
    hasNextPage,
    isFetchingNextPage
  })

  const images = useMemo(() => data.pages.flatMap((page) => page.data), [data])

  useEffect(() => {
    imageRefs.current = imageRefs.current.slice(0, images.length)
  }, [images.length])

  useEffect(() => {
    if (!isViewBoxOpen || !hasNextPage || isFetchingNextPage) return

    const nearingEnd = index + 4 >= images.length
    if (nearingEnd) {
      fetchNextPage()
    }
  }, [
    isViewBoxOpen,
    index,
    images.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  ])

  const onImageClick = (clickedIndex: number) => {
    setIndex(clickedIndex)
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

  const showEmpty = images.length === 0

  if (showEmpty) {
    return <EmptyState />
  }

  const showEnd = !hasNextPage && !isFetching && !isFetchingNextPage

  return (
    <>
      <div className="relative select-none">
        <motion.div
          animate={{
            opacity: isViewBoxOpen ? 0 : 1,
            scale: isViewBoxOpen ? 0.98 : 1
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut"
          }}
          style={{
            pointerEvents: isViewBoxOpen ? "none" : "auto"
          }}
          className="py-4"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
            {images.map((image, idx) => (
              <div
                key={image.id}
                ref={(el) => {
                  imageRefs.current[idx] = el
                }}
              >
                <ImageOptions imageId={image.id} isBinView={isBinView}>
                  <ImageCard
                    image={image}
                    index={idx}
                    onClick={() => onImageClick(idx)}
                    isBinView={isBinView}
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

      {isFetchingNextPage && <LoadingBanner />}
      {showEnd && <EndBanner />}
      {isFetchNextPageError && <ErrorBanner />}

      <div ref={loaderRef} className="h-20 w-full" />
    </>
  )
}
