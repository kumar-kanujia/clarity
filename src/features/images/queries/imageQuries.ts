import { infiniteQueryOptions } from "@tanstack/react-query"

import {
  fetchFavorites,
  fetchAllImages,
  fetchTrash,
  fetchTagImages,
  type CreatedAtCursor
} from "@/tauri"

export const allImagesQueryKey = ["all"] as const
export const favoritesQueryKey = ["favorite"] as const
export const trashQueryKey = ["trash"] as const
export const tagQueryKey = ["tag"] as const

type PageParam = CreatedAtCursor | null

const paginationBase = {
  initialPageParam: null as PageParam,
  getNextPageParam: (lastPage: { nextCursor?: PageParam }) =>
    lastPage?.nextCursor ?? null
}

const cursorQueryFn =
  <T>(fetcher: (args: { cursor?: CreatedAtCursor }) => Promise<T>) =>
  async ({ pageParam }: { pageParam: PageParam }) =>
    fetcher({ cursor: pageParam ?? undefined })

export const getAllImageQueryOptions = () =>
  infiniteQueryOptions({
    queryKey: allImagesQueryKey,
    queryFn: cursorQueryFn(fetchAllImages),
    ...paginationBase
  })

export const getFavoriteImageQueryOptions = () =>
  infiniteQueryOptions({
    queryKey: favoritesQueryKey,
    queryFn: cursorQueryFn(fetchFavorites),
    ...paginationBase
  })

export const getTrashImageQueryOptions = () =>
  infiniteQueryOptions({
    queryKey: trashQueryKey,
    queryFn: cursorQueryFn(fetchTrash),
    ...paginationBase
  })

export const getTagImageQueryOptions = (tagId: number) =>
  infiniteQueryOptions({
    queryKey: [...tagQueryKey, tagId] as const,
    queryFn: async ({ pageParam }: { pageParam: PageParam }) =>
      fetchTagImages({ tagId, cursor: pageParam ?? undefined }),
    ...paginationBase
  })
