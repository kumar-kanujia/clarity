import {
  useMutation,
  useQueryClient,
  type QueryKey
} from "@tanstack/react-query"
import {
  allImagesQueryKey,
  favoritesQueryKey,
  trashQueryKey,
  tagQueryKey
} from "../queries"
import {
  deleteFromTrash,
  emptyTrash,
  moveToTrash,
  restoreFromTrash
} from "@/tauri"

type PaginatedData = {
  pages: Array<{ data: Array<{ id: number }> }>
  pageParams: unknown[]
}

type GallerySnapshot = [QueryKey, PaginatedData | undefined][]

interface OptimisticMutationOptions {
  mutationFn: (imageIds: number[]) => Promise<unknown>
  /**
   * Query key prefixes to exclude from the optimistic filter sweep.
   * e.g. excluding trashQueryKey when moving to trash (we don't want to
   * remove from trash before it's been added there).
   */
  excludeQueryKeys?: QueryKey[]
  invalidateQueryKeys: QueryKey[]
}

/** All gallery-type query key prefixes that hold paginated image data */
const ALL_GALLERY_KEYS = [
  allImagesQueryKey,
  favoritesQueryKey,
  trashQueryKey,
  tagQueryKey
] as const

const filterPaginatedImages = (
  data: PaginatedData | undefined,
  imageIds: number[]
): PaginatedData | undefined => {
  if (!data) return data
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      data: page.data.filter((item) => !imageIds.includes(item.id))
    }))
  }
}

const EMPTY_PAGINATED_STATE: PaginatedData = {
  pages: [{ data: [] }],
  pageParams: [null]
}

const useOptimisticImageMutation = ({
  mutationFn,
  excludeQueryKeys = [],
  invalidateQueryKeys
}: OptimisticMutationOptions) => {
  const qc = useQueryClient()

  const activeGalleryKeys = ALL_GALLERY_KEYS.filter(
    (key) => !excludeQueryKeys.some((ex) => ex[0] === key[0])
  )

  return useMutation({
    mutationFn: ({ imageIds }: { imageIds: number[] }) => mutationFn(imageIds),

    onMutate: async ({ imageIds }) => {
      await Promise.all(
        activeGalleryKeys.map((key) => qc.cancelQueries({ queryKey: key }))
      )

      const snapshots: GallerySnapshot = activeGalleryKeys.flatMap((key) =>
        qc.getQueriesData<PaginatedData>({ queryKey: key })
      )

      for (const [key] of snapshots) {
        qc.setQueryData(key, (old: PaginatedData | undefined) =>
          filterPaginatedImages(old, imageIds)
        )
      }

      return { snapshots }
    },

    onError: (_err, _vars, ctx) => {
      for (const [key, data] of ctx?.snapshots ?? []) {
        qc.setQueryData(key, data)
      }
    },

    onSettled: () => {
      for (const key of invalidateQueryKeys) {
        qc.invalidateQueries({ queryKey: key })
      }
    }
  })
}

/** Move to trash — remove from all galleries except trash itself */
export const useMoveToTrash = () =>
  useOptimisticImageMutation({
    mutationFn: (imageIds) => moveToTrash({ imageIds }),
    excludeQueryKeys: [trashQueryKey],
    invalidateQueryKeys: [trashQueryKey]
  })

/** Restore from trash — remove from trash, invalidate all galleries */
export const useUndoMoveToTrash = () =>
  useOptimisticImageMutation({
    mutationFn: (imageIds) => restoreFromTrash({ imageIds }),
    excludeQueryKeys: [allImagesQueryKey, favoritesQueryKey, tagQueryKey],
    invalidateQueryKeys: [allImagesQueryKey, favoritesQueryKey, tagQueryKey]
  })

/** Permanently delete — remove from all galleries including trash */
export const useDeleteFromTrash = () =>
  useOptimisticImageMutation({
    mutationFn: (imageIds) => deleteFromTrash({ imageIds }),
    excludeQueryKeys: [],
    invalidateQueryKeys: [trashQueryKey]
  })

/** Empty trash — wipe trash and all galleries */
export const useEmptyTrash = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: emptyTrash,

    onMutate: async () => {
      await Promise.all(
        ALL_GALLERY_KEYS.map((key) => qc.cancelQueries({ queryKey: key }))
      )

      const snapshots: GallerySnapshot = ALL_GALLERY_KEYS.flatMap((key) =>
        qc.getQueriesData<PaginatedData>({ queryKey: key })
      )

      for (const [key] of snapshots) {
        qc.setQueryData(key, EMPTY_PAGINATED_STATE)
      }

      return { snapshots }
    },

    onError: (_err, _vars, ctx) => {
      for (const [key, data] of ctx?.snapshots ?? []) {
        qc.setQueryData(key, data)
      }
    },

    onSettled: () => {
      for (const key of ALL_GALLERY_KEYS) {
        qc.invalidateQueries({ queryKey: key })
      }
    }
  })
}
