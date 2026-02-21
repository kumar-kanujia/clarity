import { motion } from "motion/react"
import type { ReactNode } from "react"

import { convertFileSrc } from "@tauri-apps/api/core"

import type { ImageItem } from "@/services/tauri"
import { useLocation } from "@tanstack/react-router"
import { FavoriteButton, UndoBinButton } from "./action-buttons"

interface ImageCardProps {
  image: ImageItem
  index: number
  onClick?: () => void
}

export const ImageCard = ({ image, index, onClick }: ImageCardProps) => {
  return (
    <Wrapper id={image.id} index={index} onClick={onClick}>
      <Container>
        <motion.img
          src={convertFileSrc(image.thumbnailPath || image.filePath)}
          alt={image.fileName}
          loading="lazy"
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.04 }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 26
          }}
        />
      </Container>
      <ActionButton imageId={image.id} isFavorite={image.isFavorite} />
      <ImageInfo image={image} />
    </Wrapper>
  )
}

const ActionButton = ({
  imageId,
  isFavorite
}: {
  imageId: number
  isFavorite: boolean
}) => {
  const { pathname } = useLocation()
  return (
    <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 ease-out">
      {pathname === "/bin" ? (
        <UndoBinButton id={imageId} />
      ) : (
        <FavoriteButton id={imageId} favorite={isFavorite} />
      )}
    </div>
  )
}

const ImageInfo = ({ image }: { image: ImageItem }) => (
  <div className="absolute bottom-3 left-3 right-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 ease-out">
    <p className="text-[11px] text-white font-medium truncate">
      {image.fileName}
    </p>

    <div className="flex items-center gap-2 mt-0.5">
      <span className="text-[9px] text-white/60">{image.resolution}</span>

      <span className="w-1 h-1 rounded-full bg-white/30" />

      <span className="text-[9px] text-white/60">{image.size}</span>
    </div>
  </div>
)

const Container = ({ children }: { children: ReactNode }) => (
  <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 group-hover:border-white/20 transition-colors duration-200">
    {children}
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
  </div>
)

const Wrapper = ({
  id,
  index,
  onClick,
  children
}: {
  id: number
  index: number
  onClick?: () => void
  children: ReactNode
}) => (
  <motion.div
    layout
    layoutId={`image-${id}`}
    onClick={onClick}
    className="group relative cursor-pointer"
    initial={{
      opacity: 0,
      y: 12
    }}
    animate={{
      opacity: 1,
      y: 0
    }}
    exit={{
      opacity: 0
    }}
    whileHover={{
      scale: 1.01
    }}
    whileTap={{
      scale: 0.99
    }}
    transition={{
      layout: {
        type: "spring",
        stiffness: 380,
        damping: 32
      },

      opacity: {
        duration: 0.2,
        ease: "easeOut",
        delay: Math.min(index * 0.02, 0.12)
      },

      y: {
        type: "spring",
        stiffness: 300,
        damping: 28,
        delay: Math.min(index * 0.02, 0.12)
      }
    }}
  >
    {children}
  </motion.div>
)
