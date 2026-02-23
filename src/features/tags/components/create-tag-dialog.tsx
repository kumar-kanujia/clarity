import { useState } from "react"
import { Plus } from "lucide-react"
import type { UseFormSetError } from "react-hook-form"

import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import { useCreateTag } from "../hooks"
import { type CreateTagParams } from "@/services/tauri"
import { TagForm, TAG_COLORS, type TagFormValues } from "./tag-form"

export const CreateTagDialog = () => {
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
      <DialogTrigger
        render={
          <Button variant="outline" size="lg">
            <Plus className="size-6 mr-2" />
            New Tag
          </Button>
        }
      />
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
