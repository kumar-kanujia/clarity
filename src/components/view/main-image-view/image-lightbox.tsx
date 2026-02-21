import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { convertFileSrc } from "@tauri-apps/api/core"
import { Button } from "@/components/ui/button"
import type { ImageItem } from "@/services/tauri"
import { useEffect, useRef } from "react"

interface ImageLightboxProps {
  data: ImageItem[]
  index: number
  setIndex: (cb: (prev: number) => number) => void
  onClick: () => void
}

export const ImageLightbox = ({
  data,
  index,
  setIndex,
  onClick
}: ImageLightboxProps) => {
  const image = data[index]

  const hasNext = index < data.length - 1
  const hasPrev = index > 0

  const directionRef = useRef<1 | -1>(1)

  const onNext = (e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation?.()
    if (index < data.length - 1) {
      directionRef.current = 1
      setIndex((prev) => prev + 1)
    }
  }

  const onPrev = (e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation?.()
    if (index > 0) {
      directionRef.current = -1
      setIndex((prev) => prev - 1)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onNext(e)
      if (e.key === "ArrowLeft") onPrev(e)
      if (e.key === "Escape") onClick()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [index])

  return (
    <AnimatePresence mode="wait">
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="
          fixed inset-0 z-50
          bg-black/80
          backdrop-blur-xl
        "
        onClick={onClick}
      />

      {/* Image container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={image.id}
            src={convertFileSrc(image.filePath || image.thumbnailPath)}
            alt={image.fileName}
            initial={{
              x: directionRef.current * 40,
              opacity: 0
            }}
            animate={{
              x: 0,
              opacity: 1
            }}
            exit={{
              x: directionRef.current * -40,
              opacity: 0
            }}
            transition={{
              duration: 0.2,
              ease: "easeOut"
            }}
            className="max-h-full max-w-full object-contain rounded-lg pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          />
        </AnimatePresence>

        {/* Prev button */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: hasPrev ? 1 : 0.3, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
          className="absolute left-6 pointer-events-auto"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrev}
            disabled={!hasPrev}
            className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </Button>
        </motion.div>

        {/* Next button */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: hasNext ? 1 : 0.3, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
          transition={{ duration: 0.2 }}
          className="absolute right-6 pointer-events-auto"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={!hasNext}
            className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
