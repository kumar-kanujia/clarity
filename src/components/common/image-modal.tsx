import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { convertFileSrc } from "@tauri-apps/api/core"

import { useImageModal } from "@/store"
import { Button } from "@/components/ui/button"

export const ImageModal = () => {
  const { isOpen, index, getImages, next, prev, close } = useImageModal()

  if (!isOpen || !getImages) return null

  const images = getImages()
  const image = images[index]

  const onNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    next()
  }

  const onPrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    prev()
  }

  const onClose = () => {
    close()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 backdrop-blur-3xl select-none"
        onClick={onClose}
      >
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <motion.img
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300
            }}
            src={convertFileSrc(image.filePath || image.thumbnailPath)}
            alt="Image Modal"
            className="max-h-full max-w-full object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-lg"
            key={"modal-image-" + image.id}
          />
        </div>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute left-4 z-50"
            key={"hdjdf"}
          >
            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full bg-background/20 backdrop-blur-md hover:bg-background/40 hover:scale-110 active:scale-95 transition-all"
              onClick={onPrev}
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-4 z-50"
            key={"nextgh"}
          >
            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full bg-background/20 backdrop-blur-md hover:bg-background/40 hover:scale-110 active:scale-95 transition-all"
              onClick={onNext}
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </Button>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
