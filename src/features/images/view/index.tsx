import { useEffect } from "react"
import { type AnyUseSuspenseInfiniteQueryOptions } from "@tanstack/react-query"

import { cn } from "@/lib/utils"
import type { ImageItem } from "@/tauri"

import {
  EndBanner,
  ErrorBanner,
  ImageGrid,
  ImageLightbox,
  LoadingBanner,
  InfoSheet,
  SelectionHeader
} from "@/features/images/components"

import { StateWithHeader } from "@/features/common/components/state"
import { useInfoStore, useLightboxPrefetch, useSelectStore } from "../store"
import {
  FavoriteButton,
  UndoTrashButton
} from "../components/image-grid/action-buttons"
import { AppHeader } from "@/features/common/components/app-header"

import { useImageGridData } from "../hooks"

export type GridMode = "default" | "trash" | "favorites" | "tag"

interface ImageGridViewProps<T extends AnyUseSuspenseInfiniteQueryOptions> {
  queryOptions: T
  mode?: GridMode
}

export const ImageGridView = <T extends AnyUseSuspenseInfiniteQueryOptions>({
  queryOptions,
  mode = "default"
}: ImageGridViewProps<T>) => {
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
  }, [])

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
  const isTrash = mode === "trash"

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <main className="flex flex-1 flex-col">
        <AppHeader>
          <SelectionHeader mode={mode} />
        </AppHeader>
        <div className="flex-1 overflow-hidden">
          <div className="h-screen px-2 select-none">
            <ImageGrid
              images={images}
              hideOptions={isTrash}
              fetchMore={fetchNextPage}
              hasMore={hasNextPage && !isFetchingNextPage}
              renderImageAction={(image) => (
                <div className="absolute top-2 right-2 z-10">
                  <ImageAction image={image} mode={mode} />
                </div>
              )}
            >
              {isFetchingNextPage && <LoadingBanner />}
              {showEnd && <EndBanner />}
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

const ImageAction = ({ image, mode }: { image: ImageItem; mode: GridMode }) => {
  if (mode === "trash") {
    return <UndoTrashButton imageId={image.id} />
  }
  return (
    <FavoriteButton
      isFavorite={image.isFavorite}
      imageId={image.id}
      className={cn(
        mode === "favorites" && "opacity-0 group-hover:opacity-100"
      )}
    />
  )
}
