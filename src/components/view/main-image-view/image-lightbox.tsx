import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import {
  ChevronLeft,
  ChevronRight,
  X,
  Info,
  ZoomIn,
  ZoomOut,
  Loader2
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import type { PanInfo } from "motion/react"
import { convertFileSrc } from "@tauri-apps/api/core"

import { Button } from "@/components/ui/button"
import type { ImageItem } from "@/services/tauri"

interface ImageLightboxProps {
  data: ImageItem[]
  index: number
  setIndex: (cb: (prev: number) => number) => void
  onClose: () => void
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 500 : -500,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -500 : 500,
    opacity: 0
  })
}

const SWIPE_THRESHOLD = 10000
const swipePower = (offset: number, velocity: number) =>
  Math.abs(offset) * velocity

export const ImageLightbox = ({
  data,
  index,
  setIndex,
  onClose
}: ImageLightboxProps) => {
  const image = data[index]

  const [isLoading, setIsLoading] = useState(true)
  const [scale, setScale] = useState(1)
  const [showInfo, setShowInfo] = useState(false)

  const directionRef = useRef<1 | -1>(1)
  const constraintsRef = useRef<HTMLDivElement>(null)

  const hasNext = index < data.length - 1
  const hasPrev = index > 0

  const paginate = useCallback(
    (newDirection: 1 | -1) => {
      directionRef.current = newDirection
      setIndex((prev) => prev + newDirection)
    },
    [setIndex]
  )

  useEffect(() => {
    setIsLoading(true)
    setScale(1)
    setShowInfo(false)
  }, [index])

  const imgSrc = useMemo(
    () => convertFileSrc(image.filePath || image.thumbnailPath),
    [image.id, image.filePath, image.thumbnailPath]
  )

  const onDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    { offset, velocity }: PanInfo
  ) => {
    if (scale > 1) return
    const swipe = swipePower(offset.x, velocity.x)
    if (swipe < -SWIPE_THRESHOLD && hasNext) paginate(1)
    else if (swipe > SWIPE_THRESHOLD && hasPrev) paginate(-1)
  }

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.5, 4))
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.5, 1))

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setScale((prev) => (prev > 1 ? 1 : 2.5))
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) handleZoomIn()
    else handleZoomOut()
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && hasNext) paginate(1)
      if (e.key === "ArrowLeft" && hasPrev) paginate(-1)
      if (e.key === "Escape") {
        if (scale > 1) setScale(1)
        else onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [index, scale, hasNext, hasPrev, paginate, onClose])

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl select-none"
        onClick={onClose}
        onWheel={handleWheel}
      >
        {/* Top Controls Bar */}
        <div className="absolute top-0 inset-x-0 p-4 md:p-6 flex justify-end items-start z-60 pointer-events-none">
          {/* Controls Wrapper - Prevents any clicks inside it from bubbling to the backdrop */}
          <div
            className="flex gap-1 md:gap-2 pointer-events-auto bg-black/40 rounded-full p-1 border border-white/10 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Info Button & Hover Panel */}
            <div
              className="relative flex items-center justify-center"
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
            >
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
              >
                <Info className="w-4 h-4 md:w-5 md:h-5" />
              </Button>

              <AnimatePresence>
                {showInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-14 right-0 w-72 p-5 rounded-2xl bg-zinc-900/95 backdrop-blur-2xl border border-white/10 text-white shadow-2xl space-y-3 text-sm z-50 cursor-default"
                  >
                    <p
                      className="font-medium truncate break-all leading-tight"
                      title={image.fileName}
                    >
                      {image.fileName}
                    </p>
                    <hr className="border-white/10" />
                    <div className="grid grid-cols-2 gap-y-2 text-white/60 text-xs">
                      <span>Size:</span>{" "}
                      <span className="text-right text-white font-medium">
                        {image.size}
                      </span>
                      <span>Resolution:</span>{" "}
                      <span className="text-right text-white font-medium">
                        {image.resolution}
                      </span>
                      <span>Added:</span>{" "}
                      <span className="text-right text-white font-medium">
                        {new Date(image.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-6 bg-white/20 my-auto mx-1" />

            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full"
              onClick={handleZoomIn}
            >
              <ZoomIn className="w-4 h-4 md:w-5 md:h-5" />
            </Button>

            {/* Replaced native 'disabled' with JS logic & CSS styling */}
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full transition-colors ${scale === 1 ? "text-white/40 cursor-default" : "text-white/80 hover:text-white hover:bg-white/20"}`}
              onClick={() => {
                if (scale > 1) handleZoomOut()
              }}
            >
              <ZoomOut className="w-4 h-4 md:w-5 md:h-5" />
            </Button>

            <div className="w-px h-6 bg-white/20 my-auto mx-1" />

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors"
              onClick={onClose}
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </Button>
          </div>
        </div>

        {/* Loading Spinner */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute z-40 flex items-center justify-center pointer-events-none"
            >
              <Loader2 className="w-10 h-10 text-white/70 animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Stage Container */}
        <div
          ref={constraintsRef}
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
        >
          <AnimatePresence initial={false} custom={directionRef.current}>
            <motion.div
              key={image.id}
              custom={directionRef.current}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              {/* Increased size back to 90vh/90vw */}
              <motion.img
                key={imgSrc}
                src={imgSrc}
                alt={image.fileName}
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
                animate={{ scale: scale }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag
                dragConstraints={
                  scale > 1
                    ? constraintsRef
                    : { left: 0, right: 0, top: 0, bottom: 0 }
                }
                dragElastic={scale > 1 ? 0.1 : 1}
                onDragEnd={onDragEnd}
                onDoubleClick={handleDoubleClick}
                className={`max-h-[90vh] max-w-[90vw] object-contain shadow-2xl rounded-sm will-change-transform pointer-events-auto ${scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
                onClick={(e) => {
                  e.stopPropagation()
                  if (scale > 1) setScale(1)
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Side Navigation */}
        {scale === 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-4 md:px-8 pointer-events-none z-50">
            {/* Replaced native 'disabled' and used pointer-events-none when hidden */}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                if (hasPrev && !isLoading) paginate(-1)
              }}
              className={`h-12 w-12 md:h-16 md:w-16 rounded-full bg-zinc-800/40 backdrop-blur-xl border border-white/10 transition-all duration-300 ${!hasPrev || isLoading ? "opacity-0 translate-x-4 pointer-events-none" : "opacity-100 translate-x-0 pointer-events-auto hover:bg-zinc-700/60"}`}
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                if (hasNext && !isLoading) paginate(1)
              }}
              className={`h-12 w-12 md:h-16 md:w-16 rounded-full bg-zinc-800/40 backdrop-blur-xl border border-white/10 transition-all duration-300 ${!hasNext || isLoading ? "opacity-0 -translate-x-4 pointer-events-none" : "opacity-100 translate-x-0 pointer-events-auto hover:bg-zinc-700/60"}`}
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </Button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
