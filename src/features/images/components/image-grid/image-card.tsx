import React, { memo, useCallback, type ReactNode } from "react"
import { motion, type Transition } from "motion/react"
import { Square, SquareCheck } from "lucide-react"

import { convertFileSrc } from "@tauri-apps/api/core"

import { cn } from "@/lib/utils"

import type { ImageItem } from "@/tauri"

import { useLightBox, useSelectStore } from "@/features/images/store"
import { useInfoStore } from "@/features/common/store"

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
  const { selectedIds, toggleSelect } = useSelectStore()

  const selected = selectedIds.has(image.id)
  const isSelecting = selectedIds.size > 0

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.altKey) return openLightbox(index)
      if (e.metaKey || isSelecting) return toggleSelect(image.id)
      openInfoSheet(image)
    },
    [image, index, isSelecting, openLightbox, openInfoSheet, toggleSelect]
  )

  const handleSelectClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      toggleSelect(image.id)
    },
    [image.id, toggleSelect]
  )

  const src = convertFileSrc(image.thumbnailPath ?? image.filePath)

  return (
    <motion.div
      layoutId={`image-${image.id}`}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={SPRING_TRANSITION}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={image.fileName}
      onKeyDown={(e) => e.key === "Enter" && openInfoSheet(image)}
      onClick={handleClick}
      className={cn(
        "group relative aspect-square cursor-pointer overflow-hidden rounded-xl select-none",
        "shadow-sm transition-shadow duration-300 hover:shadow-lg",
        selected
          ? "ring-primary ring-offset-background ring-2 ring-offset-2"
          : "ring-1 ring-white/10 hover:ring-white/20"
      )}
    >
      <img
        src={src}
        alt={image.fileName}
        draggable={false}
        className={cn(
          "size-full object-cover transition-transform duration-500 ease-out",
          "group-hover:scale-105"
        )}
      />

      {/* Gradient overlay — richer than flat black */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 transition-opacity duration-200",
          "bg-linear-to-t from-black/50 via-black/10 to-transparent",
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      />

      {/* Top-left vignette for checkbox contrast */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-linear-to-br from-black/30 via-transparent to-transparent",
          "transition-opacity duration-200",
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      />

      <motion.button
        initial={false}
        animate={{
          opacity: selected ? 1 : 0,
          scale: selected ? 1 : 0.8
        }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        aria-label={selected ? "Deselect image" : "Select image"}
        aria-checked={selected}
        role="checkbox"
        onClick={handleSelectClick}
        className={cn(
          "absolute top-2.5 left-2.5 z-10 rounded-md p-0.5",
          "focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
          "group-hover:opacity-100"
        )}
      >
        {selected ? (
          <SquareCheck className="fill-primary text-primary-foreground size-4.5 drop-shadow-sm" />
        ) : (
          <Square className="size-4.5 text-white drop-shadow-sm" />
        )}
      </motion.button>

      <div
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 px-2.5 py-2",
          "translate-y-1 transition-transform duration-200 group-hover:translate-y-0",
          "opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        )}
      >
        <p className="truncate text-[11px] leading-none font-medium text-white/90 drop-shadow-sm">
          {image.fileName}
        </p>
      </div>

      {children}
    </motion.div>
  )
})
