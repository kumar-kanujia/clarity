import { useMutation, useQueryClient } from "@tanstack/react-query"

import { toggleTag, type TagItem } from "@/services/tauri"
import {
  allTagsQueryKey,
  attachedTagsQueryKey,
  availableTagsQueryKey,
  tagQueryKey
} from "."

export const useToggleTag = () => {
  const qc = useQueryClient()

  const { mutate, isSuccess, isPending } = useMutation({
    mutationFn: async ({
      imageId,
      tagId
    }: {
      imageId: number
      tagId: number
    }) => {
      return toggleTag({ imageId, tagId })
    },
    onMutate: async ({ imageId, tagId }) => {
      const attachedKey = [...attachedTagsQueryKey, imageId]
      const availableKey = [...availableTagsQueryKey, imageId]
      const tagGalleryKey = [...tagQueryKey, tagId]

      await Promise.all([
        qc.cancelQueries({ queryKey: attachedKey }),
        qc.cancelQueries({ queryKey: availableKey }),
        qc.cancelQueries({ queryKey: tagGalleryKey })
      ])

      const prevAttached = qc.getQueryData<TagItem[]>(attachedKey) || []
      const prevAvailable = qc.getQueryData<TagItem[]>(availableKey) || []

      const prevAvailableImage = qc.getQueryData(tagGalleryKey) || []

      qc.setQueryData(tagGalleryKey, (oldData: any) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.filter((item: any) => item.id !== imageId)
          }))
        }
      })

      const tagToToggle =
        prevAttached.find((t) => t.id === tagId) ||
        prevAvailable.find((t) => t.id === tagId)

      if (tagToToggle) {
        const isCurrentlyAttached = prevAttached.some((t) => t.id === tagId)

        if (isCurrentlyAttached) {
          qc.setQueryData(
            attachedKey,
            prevAttached.filter((t) => t.id !== tagId)
          )
          qc.setQueryData(availableKey, [...prevAvailable, tagToToggle])
        } else {
          qc.setQueryData(
            availableKey,
            prevAvailable.filter((t) => t.id !== tagId)
          )
          qc.setQueryData(attachedKey, [...prevAttached, tagToToggle])
        }
      }

      return {
        prevAttached,
        prevAvailable,
        prevAvailableImage,
        attachedKey,
        availableKey,
        tagGalleryKey
      }
    },
    onError: (_err, _variables, context) => {
      if (context) {
        qc.setQueryData(context.attachedKey, context.prevAttached)
        qc.setQueryData(context.availableKey, context.prevAvailable)
        qc.setQueryData(context.tagGalleryKey, context.prevAvailableImage)
      }
    },
    onSettled: (_data, _error, { imageId, tagId }) => {
      qc.invalidateQueries({ queryKey: [...attachedTagsQueryKey, imageId] })
      qc.invalidateQueries({ queryKey: [...availableTagsQueryKey, imageId] })
      qc.invalidateQueries({ queryKey: [...tagQueryKey, tagId] })
      qc.invalidateQueries({ queryKey: allTagsQueryKey })
    }
  })

  return { mutate, isSuccess, isPending }
}
