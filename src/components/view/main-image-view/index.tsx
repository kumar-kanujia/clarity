import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSuspenseInfiniteQuery } from "@tanstack/react-query"
import { useLocation } from "@tanstack/react-router"
import { useVirtualizer } from "@tanstack/react-virtual"
import { motion } from "motion/react"

import type { ImageItemResult } from "@/services/tauri"
import type { AnySuspenseInfiniteQueryOptions } from "@/types"

import {
  EndBanner,
  EmptyState,
  ErrorBanner,
  LoadingBanner,
  ImageLightbox
} from "@/components/common"

import { ImageOptions } from "./image-options"
import { ImageCard } from "./image-card"
import { useSelectStore } from "@/store"

interface MainImageViewProps<T extends AnySuspenseInfiniteQueryOptions> {
  queryOptions: T
}

export const MainImageView = <T extends AnySuspenseInfiniteQueryOptions>({
  queryOptions
}: MainImageViewProps<T>) => {
  const [index, setIndex] = useState(0)
  const [isViewBoxOpen, setIsViewBoxOpen] = useState(false)

  const { reset } = useSelectStore()

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

  const images = useMemo(() => data.pages.flatMap((page) => page.data), [data])

  // --- 1. RESPONSIVE COLUMNS LOGIC ---
  // Match these exactly with your Tailwind breakpoints (md: 768px, lg: 1024px)
  const [cols, setCols] = useState(4)

  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth >= 1024) setCols(4)
      else if (window.innerWidth >= 768) setCols(3)
      else setCols(2)
    }
    updateCols() // Initial check
    window.addEventListener("resize", updateCols)
    return () => window.removeEventListener("resize", updateCols)
  }, [])

  const rowCount = Math.ceil(images.length / cols)

  // --- 2. VIRTUALIZER SETUP ---
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300, // Estimated pixel height of a single row
    overscan: 3 // Render 3 rows off-screen for smooth scrolling
  })

  const virtualItems = virtualizer.getVirtualItems()

  // --- 3. INFINITE SCROLL TRIGGER ---
  // Trigger fetch when the virtualizer scrolls near the bottom
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1]
    if (!lastItem) return

    if (lastItem.index >= rowCount - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [virtualItems, rowCount, hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    if (!isViewBoxOpen || !hasNextPage || isFetchingNextPage) return
    const nearingEnd = index + 4 >= images.length
    if (nearingEnd) fetchNextPage()
  }, [
    isViewBoxOpen,
    index,
    images.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  ])

  // --- 4. HANDLERS ---
  const onImageClick = useCallback((clickedIndex: number) => {
    setIndex(clickedIndex)
    setIsViewBoxOpen(true)
  }, [])

  const onViewBoxClose = useCallback(() => {
    setIsViewBoxOpen(false)

    // Scroll restoration using Virtualizer's native API
    requestAnimationFrame(() => {
      const rowIndex = Math.floor(index / cols)
      virtualizer.scrollToIndex(rowIndex, {
        behavior: "smooth",
        align: "center"
      })
    })
  }, [index, cols, virtualizer])

  const showEmpty = images.length === 0
  const showEnd = !hasNextPage && !isFetching && !isFetchingNextPage

  if (showEmpty) return <EmptyState />

  return (
    <>
      {/* CRITICAL: The virtualizer relies on this exact div for scroll position. 
        It must have a strict height (h-full) and overflow-y-auto.
      */}
      <div
        ref={parentRef}
        className="h-full w-full overflow-y-auto overflow-x-hidden relative"
        onClick={() => reset()}
      >
        <motion.div
          animate={{
            opacity: isViewBoxOpen ? 0 : 1,
            scale: isViewBoxOpen ? 0.98 : 1
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ pointerEvents: isViewBoxOpen ? "none" : "auto" }}
          className="py-4 px-4"
        >
          {/* The canvas that dictates the total scroll height */}
          <div
            className="relative w-full"
            style={{ height: `${virtualizer.getTotalSize()}px` }}
          >
            {virtualItems.map((virtualRow) => {
              // Extract the chunk of images for this specific row
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
                  {/* The actual CSS Grid applied to just this single row */}
                  <div
                    className="grid gap-6 pb-6"
                    style={{
                      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
                    }}
                  >
                    {rowImages.map((image, i) => {
                      const actualIndex = startIndex + i
                      return (
                        <ImageOptions
                          key={image.id}
                          imageId={image.id}
                          isBinView={isBinView}
                        >
                          <ImageCard
                            image={image}
                            index={actualIndex}
                            onClick={() => onImageClick(actualIndex)}
                            isBinView={isBinView}
                          />
                        </ImageOptions>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Banners are placed natively at the bottom of the scroll container */}
        <div className="w-full flex flex-col items-center pb-12">
          {isFetchingNextPage && <LoadingBanner />}
          {showEnd && <EndBanner />}
          {isFetchNextPageError && <ErrorBanner />}
        </div>
      </div>

      {isViewBoxOpen && (
        <ImageLightbox
          data={images}
          index={index}
          setIndex={setIndex}
          onClose={onViewBoxClose}
        />
      )}
    </>
  )
}
