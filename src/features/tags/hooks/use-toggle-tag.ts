import { useMutation, useQueryClient } from "@tanstack/react-query"

import { toggleTag, type TagItem } from "@/services/tauri"
import { allTagsQueryKey, attachedTagsQueryKey, availableTagsQueryKey } from "."

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
      // 1. FIXED: Added the spread (...) operator to flatten the keys!
      const attachedKey = [...attachedTagsQueryKey, imageId]
      const availableKey = [...availableTagsQueryKey, imageId]

      // Cancel outgoing queries to prevent race conditions
      await Promise.all([
        qc.cancelQueries({ queryKey: attachedKey }),
        qc.cancelQueries({ queryKey: availableKey })
      ])

      // Snapshot the current state
      const prevAttached = qc.getQueryData<TagItem[]>(attachedKey) || []
      const prevAvailable = qc.getQueryData<TagItem[]>(availableKey) || []

      // Find the tag we are interacting with
      const tagToToggle =
        prevAttached.find((t) => t.id === tagId) ||
        prevAvailable.find((t) => t.id === tagId)

      // Optimistically swap the tag between the two lists
      if (tagToToggle) {
        const isCurrentlyAttached = prevAttached.some((t) => t.id === tagId)

        if (isCurrentlyAttached) {
          // Move from attached -> available
          qc.setQueryData(
            attachedKey,
            prevAttached.filter((t) => t.id !== tagId)
          )
          qc.setQueryData(availableKey, [...prevAvailable, tagToToggle])
        } else {
          // Move from available -> attached
          qc.setQueryData(
            availableKey,
            prevAvailable.filter((t) => t.id !== tagId)
          )
          qc.setQueryData(attachedKey, [...prevAttached, tagToToggle])
        }
      }

      return { prevAttached, prevAvailable, attachedKey, availableKey }
    },
    onError: (_err, _variables, context) => {
      // Rollback to snapshots if the Tauri command fails
      if (context) {
        qc.setQueryData(context.attachedKey, context.prevAttached)
        qc.setQueryData(context.availableKey, context.prevAvailable)
      }
    },
    onSettled: (_data, _error, { imageId }) => {
      // 2. FIXED: Also spread the keys here so the background refetch targets the right cache!
      qc.invalidateQueries({ queryKey: [...attachedTagsQueryKey, imageId] })
      qc.invalidateQueries({ queryKey: [...availableTagsQueryKey, imageId] })
      qc.invalidateQueries({ queryKey: allTagsQueryKey }) // No spread needed here since there's no imageId attached
    }
  })

  return { mutate, isSuccess, isPending }
}
