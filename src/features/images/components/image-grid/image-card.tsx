import React, { memo, useState, type ReactNode } from "react"
import { motion } from "motion/react"
import { Square, SquareCheck } from "lucide-react"

import { cn } from "@/lib/utils"

import type { ImageItem } from "@/tauri"
import { convertFileSrc } from "@tauri-apps/api/core"
import { useInfoStore, useLightBox } from "../../store"

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
    const [selected, setSelected] = useState(false)
    const { open } = useLightBox()
    const { openInfoSheet } = useInfoStore()

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button === 0 && e.altKey) {
        open(index)
      } else if (e.button === 0 && e.metaKey) {
        setSelected(!selected)
      } else {
        setSelected(false)
        openInfoSheet(image)
      }
    }

    const onSquareClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      setSelected(!selected)
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
          "group relative aspect-square rounded-2xl overflow-hidden select-none",
          selected ? "ring-2 ring-primary" : "hover:ring-2 ring-black/20"
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
              ? "opacity-100 text-primary"
              : "opacity-0 group-hover:opacity-100"
          )}
          onClick={onSquareClick}
        >
          {selected ? (
            <SquareCheck className="size-5 fill-primary text-primary-foreground" />
          ) : (
            <Square className="size-5" />
          )}
        </button>
      </motion.div>
    )
  },
  (prev, next) => {
    return prev.image.id === next.image.id
  }
)
