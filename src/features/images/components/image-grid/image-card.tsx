import type { ImageItem } from "@/tauri"
import { convertFileSrc } from "@tauri-apps/api/core"

import React, { memo, type ReactNode } from "react"

import { motion } from "motion/react"
import { Square, SquareCheck } from "lucide-react"

import { cn } from "@/lib/utils"

import {
  useInfoStore,
  useLightBox,
  useSelectStore
} from "@/features/images/store"

export const ImageCard = memo(
  ({
    image,
    index,
    children
  }: {
    image: ImageItem
    index: number
    children?: ReactNode
  }) => {
    const { selectedIds, toggleSelect, reset } = useSelectStore()
    const { open: openLightbox } = useLightBox()
    const { openInfoSheet } = useInfoStore()

    const selected = selectedIds.has(image.id)

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button === 0 && e.altKey) {
        openLightbox(index)
      } else if (e.button === 0 && e.metaKey) {
        toggleSelect(image.id)
      } else if (selectedIds.size > 0) {
        reset()
      } else {
        openInfoSheet(image)
      }
    }

    const onSquareClick = (e: React.MouseEvent<HTMLButtonElement>) => {
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
        transition={{
          layout: { type: "spring", stiffness: 380, damping: 32 },
          opacity: { duration: 0.15 }
        }}
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

        {children}

        <button
          className={cn(
            "absolute top-3 left-3 z-10 transition-opacity focus:outline-none",
            selected
              ? "text-primary opacity-100"
              : "opacity-0 group-hover:opacity-100"
          )}
          onClick={onSquareClick}
        >
          {selected ? (
            <SquareCheck className="fill-primary text-primary-foreground size-4" />
          ) : (
            <Square className="size-4" />
          )}
        </button>
      </motion.div>
    )
  }
)
