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
import { useDeleteTagStore } from "../store"
import { useEffect, useState } from "react"
import { useSoftDeleteTag } from "../hooks"
import { useQueryClient } from "@tanstack/react-query"

export const DeleteTagDialog = () => {
  const qc = useQueryClient()

  const [open, setOpen] = useState(false)

  const { tag, closeDeleteDialog } = useDeleteTagStore()

  const { mutate, isPending } = useSoftDeleteTag()

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
        onSuccess: async () => {
          await qc.invalidateQueries({
            refetchType: "all",
            queryKey: ["tags"]
          })
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
            Delete {tag.tagName}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
