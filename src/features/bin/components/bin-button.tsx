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

import { getBinQueryOptions, useEmptyBin, useMultipleEmptyBin } from "../hooks"
import { useSuspenseInfiniteQuery } from "@tanstack/react-query"
import { useSelectStore } from "@/store"

export const BinButton = () => {
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useEmptyBin()

  const { imageIds } = useSelectStore()

  const { pathname } = useLocation()

  const { data } = useSuspenseInfiniteQuery(getBinQueryOptions())

  let has_data = false

  if (data.pages[0].data.length > 0) {
    has_data = true
  }

  if (pathname != "/bin" || !has_data || imageIds.size > 0) {
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

export const BinButton2 = () => {
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useMultipleEmptyBin()

  const { imageIds } = useSelectStore()

  const { pathname } = useLocation()

  const { data } = useSuspenseInfiniteQuery(getBinQueryOptions())

  let has_data = false

  if (data.pages[0].data.length > 0) {
    has_data = true
  }

  if (pathname != "/bin" || !has_data || imageIds.size === 0) {
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
            <p>
              This action cannot be undone. This will permanently delete
              selected {imageIds.size} image in Bin.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              mutate(Array.from(imageIds), { onSuccess: () => setOpen(false) })
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
