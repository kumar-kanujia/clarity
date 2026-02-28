import { useState, type ReactNode } from "react"
import type { UseFormSetError } from "react-hook-form"

import { Dialog } from "@/components/ui/dialog"
import { useCreateTag } from "../hooks"
import { TAG_COLORS, TagForm, type TagFormValues } from "./tag-form"
import type { CreateTagParams } from "@/tauri"

export const CreateTagDialog = ({ children }: { children?: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { mutate, isPending } = useCreateTag()

  const defaultValues: TagFormValues = {
    tagText: "",
    color: TAG_COLORS[0]
  }

  const handleSubmit = (
    data: TagFormValues,
    setError: UseFormSetError<TagFormValues>
  ) => {
    const payload: CreateTagParams = {
      tagName: data.tagText,
      color: data.color
    }

    mutate(payload, {
      onSuccess: () => setIsOpen(false),
      onError: () => {
        setError("tagText", {
          type: "server",
          message: "Tag with this name already exists."
        })
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children}
      <TagForm
        title="Create New Tag"
        submitLabel={isPending ? "Creating..." : "Create"}
        isPending={isPending}
        defaultValues={defaultValues}
        onCancel={() => setIsOpen(false)}
        onSubmit={handleSubmit}
      />
    </Dialog>
  )
}
