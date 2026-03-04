import { convertFileSrc } from "@tauri-apps/api/core"
import { Separator } from "@/components/ui/separator"
import { Metadata } from "./metadata"
import { SheetActions } from "./sheet-actions"
import { Tags } from "./tags"
import type { ImageItem } from "@/tauri"
import { useInfoStore } from "@/features/common/store"
import { useLocation } from "@tanstack/react-router"

interface ImageInfoPanelProps {
  image: ImageItem
}

export const ImageInfoPanel = ({ image }: ImageInfoPanelProps) => {
  const { pathname } = useLocation()

  const { closeInfoSheet } = useInfoStore()

  const isTrashRoue = pathname === "/trash"

  return (
    <>
      <div className="relative flex items-center justify-center overflow-hidden rounded-lg">
        <img
          src={convertFileSrc(image.filePath)}
          alt={image.fileName}
          className="h-auto max-h-62.5 w-full object-contain"
        />
      </div>
      {!isTrashRoue && (
        <>
          <Separator />
          <Tags imageId={image.id} />
        </>
      )}
      <Separator />
      <Metadata image={image} />
      <Separator />

      <SheetActions
        imageId={image.id}
        close={closeInfoSheet}
        isTrashRoue={isTrashRoue}
      />
    </>
  )
}
