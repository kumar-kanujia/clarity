import {
  fetchGallery,
  type GalleryImageResult,
  type ImageCursor
} from "@/services/tauri"
import { ImageCard } from "../components/image-card"
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { useImageModal } from "@/features/shared/store/use-image-model-store"

type Cursor = ImageCursor | null

export const GalleryView = () => {
  const loaderRef = useRef<HTMLDivElement>(null)

  const { data, fetchNextPage, isLoading, hasNextPage } = useInfiniteQuery<
    GalleryImageResult,
    Error,
    InfiniteData<GalleryImageResult>,
    string[],
    Cursor
  >({
    queryKey: ["gallery"],
    queryFn: async ({ pageParam = null }) => {
      const res = await fetchGallery({
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

  const openModal = useImageModal((s) => s.open)

  const getImages = () => data?.pages.flatMap((page) => page.data) ?? []

  return (
    <div className="py-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
        {getImages().map((image, idx) => (
          <ImageCard
            key={image.imageId}
            image={image}
            index={idx}
            onClick={() => openModal(getImages, idx)}
          />
        ))}
      </div>
      <div ref={loaderRef} className="h-20 w-full" />
    </div>
  )
}
