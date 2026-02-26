import { useState } from "react"
import { useLocation } from "@tanstack/react-router"
import { LucideTrash2 } from "lucide-react"

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
import { Button } from "@/components/ui/button"

import { getBinQueryOptions, useEmptyBin } from "../hooks"
import { useSuspenseInfiniteQuery } from "@tanstack/react-query"

export const BinButton = () => {
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useEmptyBin()

  const { pathname } = useLocation()

  const { data } = useSuspenseInfiniteQuery(getBinQueryOptions())

  let has_data = false

  if (data.pages[0].data.length > 0) {
    has_data = true
  }

  if (pathname != "/bin" || !has_data) {
    return null
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        nativeButton={false}
        render={
          <Button variant="ghost" size="icon-sm" className="hover:text-red-400">
            <LucideTrash2 />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete all the
            images in Bin.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              console.log("delete")
              mutate(void {}, { onSuccess: () => setOpen(false) })
            }}
            disabled={isPending}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
