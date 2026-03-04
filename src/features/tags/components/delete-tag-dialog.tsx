import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { useEffect, useState } from "react"
import { useDeleteTagStore } from "../store/tag-store"

import { useDeleteTag } from "../hooks"

export const DeleteTagDialog = () => {
  const [open, setOpen] = useState(false)

  const { tag, closeDeleteDialog } = useDeleteTagStore()

  const { mutate, isPending } = useDeleteTag()

  useEffect(() => {
    if (tag) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [tag])

  const handleConfirmDelete = () => {
    if (tag) {
      mutate(tag.id, {
        onSuccess: () => {
          closeDeleteDialog()
        }
      })
    }
  }

  if (!tag) {
    return null
  }

  return (
    <AlertDialog open={open} onOpenChange={closeDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the tag{" "}
            <strong>{tag.tagName}</strong> and remove it from all associated
            images.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={closeDeleteDialog} disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant={"destructive"}
            onClick={() => handleConfirmDelete()}
            disabled={isPending}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
