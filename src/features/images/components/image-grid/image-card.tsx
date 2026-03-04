import React, { memo, type ReactNode } from "react"
import { motion, type Transition } from "motion/react"
import { Square, SquareCheck } from "lucide-react"

import { convertFileSrc } from "@tauri-apps/api/core"

import { cn } from "@/lib/utils"

import type { ImageItem } from "@/tauri"

import {
  useInfoStore,
  useLightBox,
  useSelectStore
} from "@/features/images/store"

const SPRING_TRANSITION = {
  layout: { type: "spring", stiffness: 380, damping: 32 },
  opacity: { duration: 0.15 }
} satisfies Transition

interface ImageCardProps {
  image: ImageItem
  index: number
  children?: ReactNode
}

export const ImageCard = memo(({ image, index, children }: ImageCardProps) => {
  const { open: openLightbox } = useLightBox()

  const { openInfoSheet } = useInfoStore()

  const { selectedIds, toggleSelect, reset } = useSelectStore()
  const selected = selectedIds.has(image.id)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.altKey) return openLightbox(index)
    if (e.metaKey) return toggleSelect(image.id)
    if (selectedIds.size > 0) return reset()
    openInfoSheet(image)
  }

  const handleSquareClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    toggleSelect(image.id)
  }

  return (
    <motion.div
      layoutId={`image-${image.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={SPRING_TRANSITION}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-2xl select-none",
        selected ? "ring-primary ring-2" : "ring-black/20 hover:ring-2"
      )}
      onClick={handleClick}
    >
      <img
        src={convertFileSrc(image.thumbnailPath || image.filePath)}
        className="size-full object-cover"
        alt={image.fileName}
      />

      <div
        className={cn(
          "absolute inset-0 bg-black/20 transition-opacity",
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      />

      <button
        className={cn(
          "absolute top-3 left-3 z-10 transition-opacity focus:outline-none",
          selected
            ? "text-primary opacity-100"
            : "opacity-0 group-hover:opacity-100"
        )}
        onClick={handleSquareClick}
      >
        {selected ? (
          <SquareCheck className="fill-primary text-primary-foreground size-4" />
        ) : (
          <Square className="size-4" />
        )}
      </button>

      {children}
    </motion.div>
  )
})
