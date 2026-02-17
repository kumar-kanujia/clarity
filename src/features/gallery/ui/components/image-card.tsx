import { motion } from "motion/react"

import type { GalleryImage } from "@/services/tauri"
import { convertFileSrc } from "@tauri-apps/api/core"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Heart } from "lucide-react"

export const ImageCard = ({
  image,
  index
}: {
  image: GalleryImage
  index: number
}) => {
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
          src={convertFileSrc(image.thumbnailPath || image.imagePath)}
          alt={image.fileName}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
        <Button
          size="icon"
          variant="secondary"
          className={cn(
            "h-9 w-9 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/10 hover:bg-white hover:text-zinc-950 transition-all duration-300",
            image.isFavorite &&
              "bg-red-500 text-white border-red-500 hover:bg-red-600 hover:text-white"
          )}
        >
          <Heart
            className={cn("w-4.5 h-4.5", image.isFavorite && "fill-current")}
          />
        </Button>
      </div>
      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2.5 group-hover:translate-y-0">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] text-white font-black truncate tracking-wide">
            {image.fileName}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-white/70 uppercase tracking-widest font-bold">
              {image.resolution}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="text-[9px] text-white/70 uppercase tracking-widest font-bold">
              {image.imageSize}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
