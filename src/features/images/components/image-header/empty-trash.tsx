import { useSuspenseInfiniteQuery } from "@tanstack/react-query"
import { Trash } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog"

import { getTrashQueryOptions } from "../../queries"
import { useEmptyTrash } from "../../hooks"
import { destructiveBtn, ConfirmDialog } from "."

export const EmptyTrash = () => {
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useEmptyTrash()
  const { data } = useSuspenseInfiniteQuery(getTrashQueryOptions())
  if (data.pages[0].data.length === 0) return null

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        nativeButton={false}
        render={<Button variant="ghost" size="sm" className={destructiveBtn} />}
      >
        <Trash className="size-3.5" />
        Empty trash
      </AlertDialogTrigger>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Empty trash?"
        description="This will permanently delete all images in the bin. This action cannot be undone."
        confirmLabel="Empty trash"
        isPending={isPending}
        onConfirm={() => mutate({}, { onSuccess: () => setOpen(false) })}
      />
    </AlertDialog>
  )
}
