import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Trash2Icon } from "lucide-react"
import { useState } from "react"
import { useDeleteFromTrash } from "../../hooks"

export const RemoveSelected = ({
  imageIds,
  onSuccess
}: {
  imageIds: number[]
  onSuccess?: () => void
}) => {
  const [open, setOpen] = useState(false)

  const { mutate, isPending } = useDeleteFromTrash()

  const handleClick = () =>
    mutate(
      { imageIds },
      {
        onSuccess: () => {
          setOpen(false)
          onSuccess?.()
        }
      }
    )

  if (imageIds.length === 0) return null

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        nativeButton={false}
        render={<Button variant={"ghost"} className="hover:text-red-600" />}
      >
        <Trash2Icon /> Remove selected
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete selected{" "}
            {imageIds.length} images.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleClick} disabled={isPending}>
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
