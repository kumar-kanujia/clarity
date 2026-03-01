import { infiniteQueryOptions } from "@tanstack/react-query"

import {
  fetchFavorites,
  fetchAllImages,
  fetchTrash,
  type CreatedAtCursor
} from "@/tauri"

export const allImagesQueryKey = ["all"]

export const getAllImageQueryOptions = () =>
  infiniteQueryOptions({
    queryKey: allImagesQueryKey,
    queryFn: async ({ pageParam = null }) => {
      const res = await fetchAllImages({
        cursor: pageParam ?? undefined
      })
      return res
    },
    initialPageParam: null as CreatedAtCursor | null,
    getNextPageParam: (lastPage) => {
      return lastPage?.nextCursor ?? null
    }
  })

export const favoritesQueryKey = ["favorite"]

export const getFavoriteImageQueryOptions = () =>
  infiniteQueryOptions({
    queryKey: favoritesQueryKey,
    queryFn: async ({ pageParam = null }) => {
      const res = await fetchFavorites({
        cursor: pageParam ?? undefined
      })
      return res
    },
    initialPageParam: null as CreatedAtCursor | null,
    getNextPageParam: (lastPage) => {
      return lastPage?.nextCursor ?? null
    }
  })

export const trashQueryKey = ["trash"]

export const getTrashImageQueryOptions = () =>
  infiniteQueryOptions({
    queryKey: trashQueryKey,
    queryFn: async ({ pageParam = null }) => {
      const res = await fetchTrash({
        cursor: pageParam ?? undefined
      })
      return res
    },
    initialPageParam: null as CreatedAtCursor | null,
    getNextPageParam: (lastPage) => {
      return lastPage?.nextCursor ?? null
    }
  })
