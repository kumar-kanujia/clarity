import { X } from "lucide-react"
import { motion } from "motion/react"

import { Button } from "@/components/ui/button"
import type { GridMode } from "../../view"
import { useSelectStore } from "../../store"
import { RestoreImages } from "./restore-images"
import { RemoveSelected } from "./remove-selected"
import { EmptyTrash, MoveToTrash, TagAction } from "."

interface ImageHeaderProps {
  mode: GridMode
}

export const ImageHeader = ({ mode }: ImageHeaderProps) => {
  const { selectedIds, reset } = useSelectStore()

  if (selectedIds.size === 0) return null

  const selectedIdsArray = Array.from(selectedIds)
  const isTrash = mode === "trash"

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="ms-auto flex items-center justify-end gap-1 px-4"
    >
      {/* Selection count + clear */}
      <Button
        variant="ghost"
        size="sm"
        onClick={reset}
        className="text-muted-foreground hover:text-foreground h-8 gap-1.5 rounded-lg px-2.5"
      >
        <span className="text-sm font-medium tabular-nums">
          {selectedIds.size}
        </span>
        <X className="size-3.5" />
      </Button>

      <div className="bg-border mx-0.5 h-4 w-px" />

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
    </motion.div>
  )
}
