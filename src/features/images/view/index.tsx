import { useEffect, useMemo } from "react"
import { useLocation } from "@tanstack/react-router"
import { useSuspenseInfiniteQuery } from "@tanstack/react-query"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { AnySuspenseInfiniteQueryOptions } from "@/types"
import type { ImageItemResult } from "@/tauri"

import {
  EndBanner,
  ErrorBanner,
  ImageGrid,
  ImageLightbox,
  LoadingBanner,
  InfoSheet
} from "@/features/images/components"

import { cn } from "@/lib/utils"

import { StateWithHeader } from "@/features/common/components/state"
import { useInfoStore, useLightboxPrefetch, useSelectStore } from "../store"
import {
  EmptyTrash,
  MoveToTrash,
  TagAction,
  RemoveSelected,
  RestoreImages
} from "../components/image-actions"

import {
  FavoriteButton,
  UndoTrashButton
} from "../components/image-grid/action-buttons"

import { AppHeader } from "@/features/common/components/app-header"

interface ImageGridViewProps<T extends AnySuspenseInfiniteQueryOptions> {
  queryOptions: T
}

const useImageGridData = <T extends AnySuspenseInfiniteQueryOptions>(
  queryOptions: T
) => {
  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isFetching,
    isFetchNextPageError
  } = useSuspenseInfiniteQuery<ImageItemResult>(queryOptions)

  const images = useMemo(() => data.pages.flatMap((page) => page.data), [data])

  return {
    images,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isFetching,
    isFetchNextPageError
  }
}

const SelectionHeader = ({ isTrashRoute }: { isTrashRoute: boolean }) => {
  const { selectedIds, reset } = useSelectStore()

  if (selectedIds.size === 0) return null

  const selectedIdsArray = Array.from(selectedIds)

  return (
    <div className="ms-auto flex items-center justify-end gap-x-1 px-4">
      <Button variant="ghost" onClick={reset}>
        <p className="text-muted-foreground text-sm">{selectedIds.size}</p>
        <X className="size-4" />
      </Button>

      {isTrashRoute ? (
        <>
          <RestoreImages imageIds={selectedIdsArray} onSuccess={reset} />
          <RemoveSelected imageIds={selectedIdsArray} onSuccess={reset} />
          <EmptyTrash />
        </>
      ) : (
        <>
          <TagAction imageIds={selectedIdsArray} onSuccess={reset} />
          <MoveToTrash imageIds={selectedIdsArray} onSuccess={reset} />
        </>
      )}
    </div>
  )
}

export const ImageGridView = <T extends AnySuspenseInfiniteQueryOptions>({
  queryOptions
}: ImageGridViewProps<T>) => {
  const { pathname } = useLocation()

  const {
    images,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isFetching,
    isFetchNextPageError
  } = useImageGridData(queryOptions)

  const { reset } = useSelectStore()
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

  if (images.length === 0) {
    return <StateWithHeader variant="empty" message="Nothing to show here!" />
  }

  const showEnd = !hasNextPage && !isFetching && !isFetchingNextPage

  const isTrashRoute = pathname === "/trash"
  const isFavoritesRoute = pathname === "/favorites"

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <main className="flex flex-1 flex-col">
        <AppHeader>
          <SelectionHeader isTrashRoute={isTrashRoute} />
        </AppHeader>
        <div className="flex-1 overflow-hidden">
          <div className="h-screen px-2 select-none">
            <ImageGrid
              images={images}
              hideOptions={isTrashRoute}
              fetchMore={fetchNextPage}
              hasMore={hasNextPage && !isFetchingNextPage}
              renderImageAction={(image) => (
                <div className="absolute top-2 right-2 z-10">
                  {isTrashRoute ? (
                    <UndoTrashButton imageId={image.id} />
                  ) : (
                    <FavoriteButton
                      isFavorite={image.isFavorite}
                      imageId={image.id}
                      className={cn(
                        isFavoritesRoute && "opacity-0 group-hover:opacity-100"
                      )}
                    />
                  )}
                </div>
              )}
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
