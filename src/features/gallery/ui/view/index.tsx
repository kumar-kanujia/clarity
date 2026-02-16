import {
  fetchImages,
  type ImageCursor,
  type PaginatedImages
} from "@/services/tauri"
import { ImageCard } from "../components/image-card"
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query"
import { useEffect, useRef } from "react"

type Cursor = ImageCursor | null

export const GalleryView = () => {
  const loaderRef = useRef<HTMLDivElement>(null)

  const { data, fetchNextPage, isLoading, hasNextPage } = useInfiniteQuery<
    PaginatedImages,
    Error,
    InfiniteData<PaginatedImages>,
    string[],
    Cursor
  >({
    queryKey: ["images"],
    queryFn: async ({ pageParam = null }) => {
      const res = await fetchImages({
        limit: 10,
        cursor: pageParam ?? undefined
      })
      return res
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      return lastPage?.nextCursor ?? null
    }
  })

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
    <div className="h-screen w-full overflow-y-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
        {data?.pages.map((page) =>
          page.data.map((image) => (
            <ImageCard key={image.path} image={image} index={image.id} />
          ))
        )}
      </div>
      <div ref={loaderRef} className="h-20 w-full" />
    </div>
  )
}
