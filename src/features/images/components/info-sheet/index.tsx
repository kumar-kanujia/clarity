import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInfoStore } from "../../store"
import { convertFileSrc } from "@tauri-apps/api/core"
import { Separator } from "@/components/ui/separator"
import { Metadata } from "./metadata"
import { SheetActions } from "./sheet-actions"
import { useEffect } from "react"

export const InfoSheet = () => {
  const { image, isOpen, closeInfoSheet } = useInfoStore()

  useEffect(() => {
    closeInfoSheet()
  }, [])

  if (!isOpen || !image) return null

  return (
    <aside className="w-80 shrink-0 flex-col h-full border-l bg-background shadow-sm hidden md:flex">
      <div
        className="flex items-center justify-end pt-3 pe-2 h-8"
        data-tauri-drag-region
      >
        <Button variant="ghost" size="icon" onClick={closeInfoSheet}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close sidebar</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="relative flex items-center justify-center overflow-hidden rounded-lg ">
          <img
            src={convertFileSrc(image.filePath)}
            alt={image.fileName}
            className="w-full h-auto max-h-62.5 object-contain"
          />
        </div>

        <Separator />
        <Metadata image={image} />
        <Separator />

        <SheetActions imageId={image.id} close={closeInfoSheet} />
      </div>
    </aside>
  )
}
