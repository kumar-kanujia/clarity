import {
  infiniteQueryOptions,
  useInfiniteQuery,
  type InfiniteData
} from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { ImageCard } from "./image-card"
import { type CreatedAtCursor, type ImageItemResult } from "@/services/tauri"

interface ImageGridProps {
  queryOptions: ReturnType<
    typeof infiniteQueryOptions<
      ImageItemResult,
      Error,
      InfiniteData<ImageItemResult>,
      readonly unknown[],
      CreatedAtCursor | null
    >
  >
}

export const ImageGrid = ({ queryOptions }: ImageGridProps) => {
  const loaderRef = useRef<HTMLDivElement>(null)

  const { data, fetchNextPage, isLoading, hasNextPage } =
    useInfiniteQuery(queryOptions)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [isLoading, hasNextPage])

  return (
    <div className="py-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
        {data?.pages.map((page) =>
          page.data.map((image, index) => (
            <ImageCard key={image.id} image={image} index={index} />
          ))
        )}
      </div>
      <div ref={loaderRef} className="h-20 w-full" />
    </div>
  )
}
