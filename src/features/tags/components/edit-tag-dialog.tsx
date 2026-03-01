import { Dialog } from "@/components/ui/dialog"
import { TagForm, type TagFormValues } from "./tag-form"
import type { UseFormSetError } from "react-hook-form"
import { useEditTagStore } from "../store/tag-store"
import type { EditTagParams } from "@/tauri"
import { useEditTag } from "../hooks"

export const EditTagDialog = () => {
  const { isOpen, tag, closeEditDialog } = useEditTagStore()
  const { mutate, isPending } = useEditTag()

  if (!tag) return null

  const defaultValues: TagFormValues = {
    tagText: tag.tagName,
    color: tag.tagColor as "#3b82f6"
  }

  const handleSubmit = (
    data: TagFormValues,
    setError: UseFormSetError<TagFormValues>
  ) => {
    const payload: EditTagParams = {
      tagId: tag.id,
      tagName: data.tagText,
      tagColor: data.color
    }

    mutate(payload, {
      onSuccess: () => closeEditDialog(),
      onError: () => {
        setError("tagText", {
          type: "server",
          message: "Tag with this name already exists."
        })
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeEditDialog}>
      <TagForm
        title="Update Tag"
        submitLabel={isPending ? "Updating..." : "Update"}
        isPending={isPending}
        defaultValues={defaultValues}
        onCancel={closeEditDialog}
        onSubmit={handleSubmit}
      />
    </Dialog>
  )
}
