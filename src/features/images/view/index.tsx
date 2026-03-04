import { useEffect, useMemo } from "react"
import { type AnyUseSuspenseInfiniteQueryOptions } from "@tanstack/react-query"

import { cn } from "@/lib/utils"
import type { ImageItem } from "@/tauri"

import {
  EndBanner,
  ErrorBanner,
  ImageGrid,
  ImageLightbox,
  LoadingBanner,
  SelectionHeader
} from "@/features/images/components"

import { useLightboxPrefetch, useSelectStore } from "../store"
import {
  FavoriteButton,
  UndoTrashButton
} from "../components/image-grid/action-buttons"

import { useImageGridData } from "../hooks"
import { useHeaderSlot } from "@/features/common/providers/header-slot-provider"
import { State } from "@/features/common/components"
import { useInfoStore } from "@/features/common/store"

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

  const headerSlot = useMemo(() => <SelectionHeader mode={mode} />, [mode])

  useHeaderSlot(headerSlot)

  if (images.length === 0) {
    return <State variant="empty" message="Nothing to show here!" />
  }

  const showEnd = !hasNextPage && !isFetching && !isFetchingNextPage
  const isTrash = mode === "trash"

  return (
    <div className="h-screen">
      <ImageGrid
        images={images}
        hideOptions={isTrash}
        fetchMore={fetchNextPage}
        hasMore={hasNextPage && !isFetchingNextPage}
        renderImageAction={(image) => <ImageAction image={image} mode={mode} />}
      >
        {isFetchingNextPage && <LoadingBanner />}
        {showEnd && <EndBanner />}
        {isFetchNextPageError && <ErrorBanner />}
      </ImageGrid>
      <ImageLightbox data={images} />
    </div>
  )
}

const ImageAction = ({ image, mode }: { image: ImageItem; mode: GridMode }) => {
  return (
    <div className="absolute top-2 right-2 z-10">
      {mode === "trash" ? (
        <UndoTrashButton imageId={image.id} />
      ) : (
        <FavoriteButton
          isFavorite={image.isFavorite}
          imageId={image.id}
          className={cn(
            mode === "favorites" && "opacity-0 group-hover:opacity-100"
          )}
        />
      )}
    </div>
  )
}
