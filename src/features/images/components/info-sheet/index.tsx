import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInfoStore } from "../../store"
import { convertFileSrc } from "@tauri-apps/api/core"
import { Separator } from "@/components/ui/separator"
import { Metadata } from "./metadata"
import { SheetActions } from "./sheet-actions"
import { Tags } from "./tags"

export const InfoSheet = () => {
  const { image, isOpen, closeInfoSheet } = useInfoStore()

  if (!isOpen || !image) return null

  return (
    <aside className="bg-background hidden h-full w-80 shrink-0 flex-col border-l shadow-sm select-none md:flex">
      <div
        className="flex h-8 items-center justify-end pe-2 pt-3"
        data-tauri-drag-region
      >
        <Button variant="ghost" size="icon" onClick={closeInfoSheet}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close sidebar</span>
        </Button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        <div className="relative flex items-center justify-center overflow-hidden rounded-lg">
          <img
            src={convertFileSrc(image.filePath)}
            alt={image.fileName}
            className="h-auto max-h-62.5 w-full object-contain"
          />
        </div>

        <Separator />
        <Tags imageId={image.id} />
        <Separator />
        <Metadata image={image} />
        <Separator />

        <SheetActions imageId={image.id} close={closeInfoSheet} />
      </div>
    </aside>
  )
}
