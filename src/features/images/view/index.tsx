import { useEffect, useMemo } from "react"
import { useSuspenseInfiniteQuery } from "@tanstack/react-query"

import type { AnySuspenseInfiniteQueryOptions } from "@/types"
import type { ImageItemResult } from "@/tauri"

import {
  EndBanner,
  ErrorBanner,
  ImageGrid,
  ImageLightbox,
  LoadingBanner
} from "../components"
import { State } from "@/features/common/components/state"
import { useLocation } from "@tanstack/react-router"
import { useInfoStore, useLightboxPrefetch, useSelectStore } from "../store"
import { FavoriteButton } from "../components/image-grid/favorite-button"
import { cn } from "@/lib/utils"
import { AppHeader } from "@/features/common/layout/app-header"
import { InfoSheet } from "../components/info-sheet"
import {
  EmptyTrash,
  MoveToTrash,
  RemoveSelected,
  RestoreImages
} from "../components/image-actions"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ImageGridViewProps<T extends AnySuspenseInfiniteQueryOptions> {
  queryOptions: T
}

export const ImageGridView = <T extends AnySuspenseInfiniteQueryOptions>({
  queryOptions
}: ImageGridViewProps<T>) => {
  const { pathname } = useLocation()

  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isFetching,
    isFetchNextPageError
  } = useSuspenseInfiniteQuery<ImageItemResult>(queryOptions)

  const images = useMemo(() => data.pages.flatMap((page) => page.data), [data])

  const { selectedIds, reset } = useSelectStore()
  const { closeInfoSheet } = useInfoStore()

  useEffect(() => {
    closeInfoSheet()
    reset()
  }, [pathname])

  useLightboxPrefetch({
    totalImages: images.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  })

  if (images.length === 0)
    return (
      <div className="flex h-screen w-full overflow-hidden">
        <main className="flex flex-1 flex-col">
          <AppHeader />
          <State variant="empty" message="Nothing to show here!" />
        </main>
      </div>
    )

  const showEnd = !hasNextPage && !isFetching && !isFetchingNextPage

  const isTrashRoute = pathname === "/trash"
  const isFavoritesRoute = pathname === "/favorites"

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <main className="flex flex-1 flex-col">
        <AppHeader>
          <div className="ms-auto px-4 flex items-center justify-end gap-x-1">
            {selectedIds.size > 0 && (
              <>
                <Button variant="ghost" onClick={reset}>
                  <p className="text-sm text-muted-foreground">
                    {selectedIds.size}
                  </p>
                  <X className="size-4" />
                </Button>
              </>
            )}
            {isTrashRoute && (
              <>
                <RestoreImages
                  imageIds={Array.from(selectedIds)}
                  onSuccess={reset}
                />
                <RemoveSelected
                  imageIds={Array.from(selectedIds)}
                  onSuccess={reset}
                />
                <EmptyTrash />
              </>
            )}
            {!isTrashRoute && (
              <>
                <MoveToTrash
                  imageIds={Array.from(selectedIds)}
                  onSuccess={reset}
                />
              </>
            )}
          </div>
        </AppHeader>
        <div className="flex-1 overflow-hidden">
          <div className="px-2 select-none h-screen">
            <ImageGrid
              images={images}
              fetchMore={fetchNextPage}
              hasMore={hasNextPage && !isFetchingNextPage}
              renderImageAction={(image) => {
                if (isTrashRoute) return null
                return (
                  <div className="absolute top-2 right-2 z-10">
                    <FavoriteButton
                      isFavorite={image.isFavorite}
                      imageId={image.id}
                      className={cn(
                        isFavoritesRoute && "opacity-0 group-hover:opacity-100"
                      )}
                    />
                  </div>
                )
              }}
            >
              {showEnd && <EndBanner />}
              {isFetchingNextPage && <LoadingBanner />}
              {isFetchNextPageError && <ErrorBanner />}
            </ImageGrid>
          </div>
        </div>
      </main>

      <InfoSheet />
      <ImageLightbox data={images} />
    </div>
  )
}
