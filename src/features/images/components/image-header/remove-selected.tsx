import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog"

import { Trash2 } from "lucide-react"
import { useState } from "react"

import { useDeleteFromTrash } from "../../hooks"

import { destructiveBtn, ConfirmDialog } from "."

export const RemoveSelected = ({
  imageIds,
  onSuccess
}: {
  imageIds: number[]
  onSuccess?: () => void
}) => {
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useDeleteFromTrash()
  if (imageIds.length === 0) return null

  const handleConfirm = () =>
    mutate(
      { imageIds },
      {
        onSuccess: () => {
          setOpen(false)
          onSuccess?.()
        }
      }
    )

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        nativeButton={false}
        render={<Button variant="ghost" size="sm" className={destructiveBtn} />}
      >
        <Trash2 className="size-3.5" />
        Remove {imageIds.length > 1 ? `${imageIds.length} images` : "image"}
      </AlertDialogTrigger>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Permanently delete?"
        description={
          <>
            This will permanently delete{" "}
            <span className="text-foreground font-medium">
              {imageIds.length} {imageIds.length === 1 ? "image" : "images"}
            </span>
            . This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        isPending={isPending}
        onConfirm={handleConfirm}
      />
    </AlertDialog>
  )
}
