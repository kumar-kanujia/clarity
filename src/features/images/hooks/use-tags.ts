import { toggleTag, type TagItem } from "@/tauri"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { attachedTagsQueryKey, availableTagsQueryKey } from "../queries"

export const useToggleTag = () => {
  const qc = useQueryClient()

  return useMutation({
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

      await Promise.all([
        qc.cancelQueries({ queryKey: attachedKey }),
        qc.cancelQueries({ queryKey: availableKey })
      ])

      const prevAttached = qc.getQueryData<TagItem[]>(attachedKey) || []
      const prevAvailable = qc.getQueryData<TagItem[]>(availableKey) || []

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
        attachedKey,
        availableKey
      }
    },
    onError: (_err, _variables, context) => {
      if (context) {
        qc.setQueryData(context.attachedKey, context.prevAttached)
        qc.setQueryData(context.availableKey, context.prevAvailable)
      }
    },
    onSettled: (_data, _error, { imageId }) => {
      qc.invalidateQueries({ queryKey: [...attachedTagsQueryKey, imageId] })
      qc.invalidateQueries({ queryKey: [...availableTagsQueryKey, imageId] })
    }
  })
}
