import type { ImageDto } from "@/services/tauri"
import { convertFileSrc } from "@tauri-apps/api/core"
import { motion } from "motion/react"

interface ImageCardProps {
  image: ImageDto
  index: number
}

export const ImageCard = ({ image, index }: ImageCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 400,
        delay: Math.min(index * 0.005, 0.1)
      }}
      className="group relative cursor-pointer"
    >
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 shadow-sm group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] group-hover:border-white/10 transition-all duration-700">
        <img
          src={convertFileSrc(image.thumbnailPath || image.path)}
          alt={image.path.split("/").pop()}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Bottom Info */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2.5 group-hover:translate-y-0">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] text-white font-black truncate tracking-wide">
              {image.path.split("/").pop()}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-white/70 uppercase tracking-widest font-bold">
                {image.resolution}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="text-[9px] text-white/70 uppercase tracking-widest font-bold">
                {image.size}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
