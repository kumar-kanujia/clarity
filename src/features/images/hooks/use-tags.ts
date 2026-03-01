import { toggleTag, type TagItem } from "@/tauri"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  attachedTagsQueryKey,
  availableTagsQueryKey,
  tagQueryKey
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
        qc.cancelQueries({ queryKey: tagGalleryKey })
      ])

      const prevAttached = qc.getQueryData<TagItem[]>(attachedKey) ?? []
      const prevAvailable = qc.getQueryData<TagItem[]>(availableKey) ?? []
      const prevTagImages = qc.getQueryData<PaginatedData>(tagGalleryKey)
      qc.setQueryData(tagGalleryKey, (old: PaginatedData | undefined) =>
        filterImageFromPages(old, imageId)
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
        tagGalleryKey
      }
    },

    onError: (_err, _vars, ctx) => {
      if (!ctx) return
      qc.setQueryData(ctx.attachedKey, ctx.prevAttached)
      qc.setQueryData(ctx.availableKey, ctx.prevAvailable)
      qc.setQueryData(ctx.tagGalleryKey, ctx.prevTagImages)
    },

    onSettled: (_data, _err, { imageId, tagId }) => {
      qc.invalidateQueries({ queryKey: [...attachedTagsQueryKey, imageId] })
      qc.invalidateQueries({ queryKey: [...availableTagsQueryKey, imageId] })
      qc.invalidateQueries({ queryKey: [...tagQueryKey, tagId] })
    }
  })
}
