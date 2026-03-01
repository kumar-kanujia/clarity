import { attachTag, removeTag, toggleTag, type TagItem } from "@/tauri"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  attachedTagsQueryKey,
  availableTagsQueryKey,
  tagQueryKey,
  untaggedImagesQueryKey
} from "../queries"

interface ToggleTagVars {
  imageId: number
  tagId: number
}

type PaginatedData = {
  pages: Array<{ data: Array<{ id: number }> }>
}

const filterImageFromPages = (
  data: PaginatedData | undefined,
  imageId: number
) => {
  if (!data) return data
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      data: page.data.filter((item) => item.id !== imageId)
    }))
  }
}

const swapTag = (
  from: TagItem[],
  to: TagItem[],
  tagId: number
): [TagItem[], TagItem[]] => {
  const tag = from.find((t) => t.id === tagId)
  if (!tag) return [from, to]
  return [from.filter((t) => t.id !== tagId), [...to, tag]]
}

export const useToggleTag = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ imageId, tagId }: ToggleTagVars) =>
      toggleTag({ imageId, tagId }),

    onMutate: async ({ imageId, tagId }) => {
      const attachedKey = [...attachedTagsQueryKey, imageId]
      const availableKey = [...availableTagsQueryKey, imageId]
      const tagGalleryKey = [...tagQueryKey, tagId]

      await Promise.all([
        qc.cancelQueries({ queryKey: attachedKey }),
        qc.cancelQueries({ queryKey: availableKey }),
        qc.cancelQueries({ queryKey: tagGalleryKey }),
        qc.cancelQueries({ queryKey: untaggedImagesQueryKey })
      ])

      const prevAttached = qc.getQueryData<TagItem[]>(attachedKey) ?? []
      const prevAvailable = qc.getQueryData<TagItem[]>(availableKey) ?? []
      const prevTagImages = qc.getQueryData<PaginatedData>(tagGalleryKey)
      const prevUntaggedImages = qc.getQueryData<PaginatedData>(
        untaggedImagesQueryKey
      )

      qc.setQueryData(tagGalleryKey, (old: PaginatedData | undefined) =>
        filterImageFromPages(old, imageId)
      )

      qc.setQueryData(
        untaggedImagesQueryKey,
        (old: PaginatedData | undefined) => filterImageFromPages(old, imageId)
      )

      const isAttached = prevAttached.some((t) => t.id === tagId)

      const [nextAttached, nextAvailable] = isAttached
        ? swapTag(prevAttached, prevAvailable, tagId)
        : swapTag(prevAvailable, prevAttached, tagId)

      qc.setQueryData(isAttached ? attachedKey : availableKey, nextAttached)
      qc.setQueryData(isAttached ? availableKey : attachedKey, nextAvailable)

      return {
        prevAttached,
        prevAvailable,
        prevTagImages,
        attachedKey,
        availableKey,
        tagGalleryKey,
        prevUntaggedImages
      }
    },

    onError: (_err, _vars, ctx) => {
      if (!ctx) return
      qc.setQueryData(ctx.attachedKey, ctx.prevAttached)
      qc.setQueryData(ctx.availableKey, ctx.prevAvailable)
      qc.setQueryData(ctx.tagGalleryKey, ctx.prevTagImages)
      qc.setQueryData(untaggedImagesQueryKey, ctx.prevUntaggedImages)
    },

    onSettled: (_data, _err, { imageId, tagId }) => {
      qc.invalidateQueries({ queryKey: [...attachedTagsQueryKey, imageId] })
      qc.invalidateQueries({ queryKey: [...availableTagsQueryKey, imageId] })
      qc.invalidateQueries({ queryKey: [...tagQueryKey, tagId] })
      qc.invalidateQueries({ queryKey: untaggedImagesQueryKey })
    }
  })
}

interface BulkTagVars {
  imageIds: number[]
  tagId: number
}

export const useAttachTag = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ imageIds, tagId }: BulkTagVars) =>
      attachTag({ imageIds, tagId }),

    onMutate: async ({ imageIds, tagId }) => {
      const tagGalleryKey = [...tagQueryKey, tagId]
      const multiAttachedKey = [...attachedTagsQueryKey, imageIds]
      const multiAvailableKey = [...availableTagsQueryKey, imageIds]

      const perImageKeys = imageIds.map((imageId) => ({
        imageId,
        attachedKey: [...attachedTagsQueryKey, imageId],
        availableKey: [...availableTagsQueryKey, imageId]
      }))

      await Promise.all([
        qc.cancelQueries({ queryKey: tagGalleryKey }),
        qc.cancelQueries({ queryKey: multiAttachedKey }),
        qc.cancelQueries({ queryKey: multiAvailableKey }),
        ...perImageKeys.flatMap(({ attachedKey, availableKey }) => [
          qc.cancelQueries({ queryKey: attachedKey }),
          qc.cancelQueries({ queryKey: availableKey })
        ]),
        qc.cancelQueries({ queryKey: untaggedImagesQueryKey })
      ])

      const prevPerImage = perImageKeys.map(
        ({ imageId, attachedKey, availableKey }) => ({
          imageId,
          attachedKey,
          availableKey,
          prevAttached: qc.getQueryData<TagItem[]>(attachedKey) ?? [],
          prevAvailable: qc.getQueryData<TagItem[]>(availableKey) ?? []
        })
      )

      const prevMultiAttached = qc.getQueryData<TagItem[]>(multiAttachedKey)
      const prevMultiAvailable = qc.getQueryData<TagItem[]>(multiAvailableKey)
      const prevTagImages = qc.getQueryData<PaginatedData>(tagGalleryKey)
      const prevUntaggedImages = qc.getQueryData<PaginatedData>(
        untaggedImagesQueryKey
      )

      // Optimistically update per-image queries
      prevPerImage.forEach(
        ({ attachedKey, availableKey, prevAttached, prevAvailable }) => {
          if (prevAttached.some((t) => t.id === tagId)) return
          const [nextAvailable, nextAttached] = swapTag(
            prevAvailable,
            prevAttached,
            tagId
          )
          qc.setQueryData(attachedKey, nextAttached)
          qc.setQueryData(availableKey, nextAvailable)
        }
      )

      // Optimistically update multi-image queries
      if (prevMultiAttached && !prevMultiAttached.some((t) => t.id === tagId)) {
        const [nextMultiAvailable, nextMultiAttached] = swapTag(
          prevMultiAvailable ?? [],
          prevMultiAttached,
          tagId
        )
        qc.setQueryData(multiAttachedKey, nextMultiAttached)
        qc.setQueryData(multiAvailableKey, nextMultiAvailable)
      }

      qc.setQueryData(
        untaggedImagesQueryKey,
        (old: PaginatedData | undefined) =>
          imageIds.reduce(
            (acc, imageId) => filterImageFromPages(acc, imageId),
            old
          )
      )

      return {
        prevPerImage,
        prevMultiAttached,
        prevMultiAvailable,
        prevTagImages,
        tagGalleryKey,
        multiAttachedKey,
        multiAvailableKey,
        prevUntaggedImages
      }
    },

    onError: (_err, _vars, ctx) => {
      if (!ctx) return
      ctx.prevPerImage.forEach(
        ({ attachedKey, availableKey, prevAttached, prevAvailable }) => {
          qc.setQueryData(attachedKey, prevAttached)
          qc.setQueryData(availableKey, prevAvailable)
        }
      )
      qc.setQueryData(ctx.multiAttachedKey, ctx.prevMultiAttached)
      qc.setQueryData(ctx.multiAvailableKey, ctx.prevMultiAvailable)
      qc.setQueryData(ctx.tagGalleryKey, ctx.prevTagImages)
      qc.setQueryData(untaggedImagesQueryKey, ctx.prevUntaggedImages)
    },

    onSettled: (_data, _err, { imageIds, tagId }) => {
      imageIds.forEach((imageId) => {
        qc.invalidateQueries({ queryKey: [...attachedTagsQueryKey, imageId] })
        qc.invalidateQueries({ queryKey: [...availableTagsQueryKey, imageId] })
      })
      qc.invalidateQueries({ queryKey: [...attachedTagsQueryKey, imageIds] })
      qc.invalidateQueries({ queryKey: [...availableTagsQueryKey, imageIds] })
      qc.invalidateQueries({ queryKey: [...tagQueryKey, tagId] })
      qc.invalidateQueries({ queryKey: untaggedImagesQueryKey })
    }
  })
}

export const useRemoveTag = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ imageIds, tagId }: BulkTagVars) =>
      removeTag({ imageIds, tagId }),

    onMutate: async ({ imageIds, tagId }) => {
      const tagGalleryKey = [...tagQueryKey, tagId]
      const multiAttachedKey = [...attachedTagsQueryKey, imageIds]
      const multiAvailableKey = [...availableTagsQueryKey, imageIds]

      const perImageKeys = imageIds.map((imageId) => ({
        imageId,
        attachedKey: [...attachedTagsQueryKey, imageId],
        availableKey: [...availableTagsQueryKey, imageId]
      }))

      await Promise.all([
        qc.cancelQueries({ queryKey: tagGalleryKey }),
        qc.cancelQueries({ queryKey: multiAttachedKey }),
        qc.cancelQueries({ queryKey: multiAvailableKey }),
        ...perImageKeys.flatMap(({ attachedKey, availableKey }) => [
          qc.cancelQueries({ queryKey: attachedKey }),
          qc.cancelQueries({ queryKey: availableKey })
        ])
      ])

      const prevPerImage = perImageKeys.map(
        ({ imageId, attachedKey, availableKey }) => ({
          imageId,
          attachedKey,
          availableKey,
          prevAttached: qc.getQueryData<TagItem[]>(attachedKey) ?? [],
          prevAvailable: qc.getQueryData<TagItem[]>(availableKey) ?? []
        })
      )

      const prevMultiAttached = qc.getQueryData<TagItem[]>(multiAttachedKey)
      const prevMultiAvailable = qc.getQueryData<TagItem[]>(multiAvailableKey)
      const prevTagImages = qc.getQueryData<PaginatedData>(tagGalleryKey)

      // Optimistically update per-image queries
      prevPerImage.forEach(
        ({ attachedKey, availableKey, prevAttached, prevAvailable }) => {
          if (!prevAttached.some((t) => t.id === tagId)) return
          const [nextAttached, nextAvailable] = swapTag(
            prevAttached,
            prevAvailable,
            tagId
          )
          qc.setQueryData(attachedKey, nextAttached)
          qc.setQueryData(availableKey, nextAvailable)
        }
      )

      // Optimistically update multi-image queries
      if (prevMultiAttached?.some((t) => t.id === tagId)) {
        const [nextMultiAttached, nextMultiAvailable] = swapTag(
          prevMultiAttached,
          prevMultiAvailable ?? [],
          tagId
        )
        qc.setQueryData(multiAttachedKey, nextMultiAttached)
        qc.setQueryData(multiAvailableKey, nextMultiAvailable)
      }

      qc.setQueryData(tagGalleryKey, (old: PaginatedData | undefined) =>
        imageIds.reduce(
          (acc, imageId) => filterImageFromPages(acc, imageId),
          old
        )
      )

      return {
        prevPerImage,
        prevMultiAttached,
        prevMultiAvailable,
        prevTagImages,
        tagGalleryKey,
        multiAttachedKey,
        multiAvailableKey
      }
    },

    onError: (_err, _vars, ctx) => {
      if (!ctx) return
      ctx.prevPerImage.forEach(
        ({ attachedKey, availableKey, prevAttached, prevAvailable }) => {
          qc.setQueryData(attachedKey, prevAttached)
          qc.setQueryData(availableKey, prevAvailable)
        }
      )
      qc.setQueryData(ctx.multiAttachedKey, ctx.prevMultiAttached)
      qc.setQueryData(ctx.multiAvailableKey, ctx.prevMultiAvailable)
      qc.setQueryData(ctx.tagGalleryKey, ctx.prevTagImages)
    },

    onSettled: (_data, _err, { imageIds, tagId }) => {
      imageIds.forEach((imageId) => {
        qc.invalidateQueries({ queryKey: [...attachedTagsQueryKey, imageId] })
        qc.invalidateQueries({ queryKey: [...availableTagsQueryKey, imageId] })
      })
      qc.invalidateQueries({ queryKey: [...attachedTagsQueryKey, imageIds] })
      qc.invalidateQueries({ queryKey: [...availableTagsQueryKey, imageIds] })
      qc.invalidateQueries({ queryKey: [...tagQueryKey, tagId] })
      qc.invalidateQueries({ queryKey: untaggedImagesQueryKey })
    }
  })
}
