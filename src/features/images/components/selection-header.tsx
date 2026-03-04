import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

import type { GridMode } from "../view"
import { useSelectStore } from "../store"

import {
  EmptyTrash,
  MoveToTrash,
  RemoveSelected,
  RestoreImages,
  TagAction
} from "./image-actions"

interface SelectionHeaderProps {
  mode: GridMode
}

export const SelectionHeader = ({ mode }: SelectionHeaderProps) => {
  const { selectedIds, reset } = useSelectStore()

  if (selectedIds.size === 0) return null

  const selectedIdsArray = Array.from(selectedIds)

  const isTrash = mode === "trash"

  return (
    <div className="ms-auto flex items-center justify-end gap-x-1 px-4">
      <Button variant="ghost" onClick={reset}>
        <p className="text-muted-foreground text-sm">{selectedIds.size}</p>
        <X className="size-4" />
      </Button>

      {isTrash ? (
        <>
          <RestoreImages imageIds={selectedIdsArray} onSuccess={reset} />
          <RemoveSelected imageIds={selectedIdsArray} onSuccess={reset} />
          <EmptyTrash />
        </>
      ) : (
        <>
          <TagAction imageIds={selectedIdsArray} onSuccess={reset} />
          <MoveToTrash imageIds={selectedIdsArray} onSuccess={reset} />
        </>
      )}
    </div>
  )
}
