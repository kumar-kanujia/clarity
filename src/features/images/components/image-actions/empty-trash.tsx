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
import { TrashIcon } from "lucide-react"
import { useState } from "react"
import { useSuspenseInfiniteQuery } from "@tanstack/react-query"
import { getTrashQueryOptions } from "../../queries"
import { useEmptyTrash } from "../../hooks"

export const EmptyTrash = () => {
  const [open, setOpen] = useState(false)

  const { mutate, isPending } = useEmptyTrash()

  const { data } = useSuspenseInfiniteQuery(getTrashQueryOptions())

  const handleClick = () => {
    mutate({}, { onSuccess: () => setOpen(false) })
  }

  if (data.pages[0].data.length === 0) return null

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        nativeButton={false}
        render={<Button variant={"ghost"} className="hover:text-red-600" />}
      >
        <TrashIcon /> Empty trash
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete all the
            images in Bin.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleClick} disabled={isPending}>
            Remove All
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
