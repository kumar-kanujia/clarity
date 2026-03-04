import { useMemo } from "react"
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

import { useLightboxPrefetch } from "../store"
import {
  FavoriteButton,
  UndoTrashButton
} from "../components/image-grid/action-buttons"

import { useImageGridData } from "../hooks"
import { useHeaderSlot } from "@/features/common/providers/header-slot-provider"
import { State } from "@/features/common/components"

export type GridMode = "default" | "trash" | "favorites" | "tag"

interface ImageGridViewProps<T extends AnyUseSuspenseInfiniteQueryOptions> {
  queryOptions: T
  mode?: GridMode
}

export const ImageGridView = <T extends AnyUseSuspenseInfiniteQueryOptions>({
  queryOptions,
  mode = "default"
}: ImageGridViewProps<T>) => {
  const headerSlot = useMemo(() => <SelectionHeader mode={mode} />, [mode])

  useHeaderSlot(headerSlot)

  const {
    images,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isFetching,
    isFetchNextPageError
  } = useImageGridData(queryOptions)

  useLightboxPrefetch({
    totalImages: images.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  })

  if (images.length === 0) {
    return <State variant="empty" message="Nothing to show here!" />
  }

  const showEnd = !hasNextPage && !isFetching && !isFetchingNextPage
  const isTrash = mode === "trash"

  return (
    <>
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
    </>
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
