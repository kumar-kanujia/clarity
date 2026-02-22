import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import {
  ChevronLeft,
  ChevronRight,
  X,
  Info,
  ZoomIn,
  ZoomOut,
  Loader2,
  Plus,
  Calendar,
  Monitor,
  HardDrive
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import type { PanInfo, Transition } from "motion/react"
import { convertFileSrc } from "@tauri-apps/api/core"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import type { ImageItem } from "@/services/tauri"
import { useQuery } from "@tanstack/react-query"
import { getAttachedTagsQueryOptions } from "@/features/tags/hooks"

const SWIPE_THRESHOLD = 10000
const swipePower = (offset: number, velocity: number) =>
  Math.abs(offset) * velocity

const polishedTransition: Transition = {
  type: "spring",
  bounce: 0,
  duration: 0.4
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.95
  })
}

export const LightboxControls = ({
  image,
  scale,
  onZoomIn,
  onZoomOut,
  onClose
}: {
  image: ImageItem
  scale: number
  onZoomIn: () => void
  onZoomOut: () => void
  onClose: () => void
}) => {
  // 1. Track if the sheet is open for lazy-fetching
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // 2. Fetch tags only when the sheet is open
  const { data: attachedTags, isLoading: isTagsLoading } = useQuery({
    ...getAttachedTagsQueryOptions(image.id, 50), // Fetch up to 50 tags for the details pane
    enabled: isSheetOpen
  })

  return (
    <div className="absolute top-0 inset-x-0 h-32 p-4 md:p-6 flex justify-end items-start z-50 pointer-events-none group">
      <div className="flex gap-1 md:gap-2 pointer-events-auto bg-black/40 rounded-full p-1 border border-white/10 backdrop-blur-md shadow-xl transition-opacity duration-300 opacity-100 md:opacity-0 group-hover:opacity-100 focus-within:opacity-100">
        {/* Bind onOpenChange to our state */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
              >
                <Info className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            }
          />
          <SheetContent className="z-100 bg-zinc-950/95 backdrop-blur-2xl border-zinc-800 text-white shadow-2xl overflow-y-auto sm:max-w-md w-full p-6">
            <SheetHeader className="mb-8">
              <SheetTitle className="text-white text-left text-lg leading-tight wrap-break-word">
                {image.fileName}
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-8">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  File Details
                </h3>
                <div className="bg-zinc-900/50 rounded-xl p-4 space-y-4 border border-zinc-800/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <HardDrive className="w-4 h-4" /> Size
                    </span>
                    <span className="font-medium text-zinc-100">
                      {image.size}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Monitor className="w-4 h-4" /> Resolution
                    </span>
                    <span className="font-medium text-zinc-100">
                      {image.resolution}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Added
                    </span>
                    <span className="font-medium text-zinc-100">
                      {new Date(image.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex justify-between items-center">
                  Tags
                </h3>
                <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50 flex flex-col gap-4">
                  {isTagsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
                    </div>
                  ) : attachedTags && attachedTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {attachedTags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-default"
                          style={{
                            borderColor: `${tag.tagColor}40`,
                            color: tag.tagColor,
                            backgroundColor: `${tag.tagColor}1A`
                          }}
                        >
                          {tag.tagName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500 text-center py-2">
                      No tags attached.
                    </p>
                  )}

                  <Button
                    variant="outline"
                    className="w-full border-zinc-700/50 bg-black/20 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all shadow-none mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Manage Tags
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="w-px h-6 bg-white/20 my-auto mx-1" />

        <Button
          variant="ghost"
          size="icon"
          className="text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
          onClick={onZoomIn}
        >
          <ZoomIn className="w-4 h-4 md:w-5 md:h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full transition-colors ${scale === 1 ? "text-white/40 cursor-default" : "text-white/80 hover:text-white hover:bg-white/20"}`}
          onClick={onZoomOut}
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
  )
}

const LightboxNavigation = ({
  hasPrev,
  hasNext,
  isLoading,
  onPrev,
  onNext
}: {
  hasPrev: boolean
  hasNext: boolean
  isLoading: boolean
  onPrev: () => void
  onNext: () => void
}) => (
  <div className="absolute inset-0 flex items-center justify-between px-4 md:px-8 pointer-events-none z-40">
    <Button
      variant="ghost"
      size="icon"
      onClick={onPrev}
      className={`h-12 w-12 md:h-16 md:w-16 rounded-full bg-zinc-800/40 backdrop-blur-xl border border-white/10 transition-all duration-300 ${!hasPrev || isLoading ? "opacity-0 translate-x-4 pointer-events-none" : "opacity-100 translate-x-0 pointer-events-auto hover:bg-zinc-700/60"}`}
    >
      <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white" />
    </Button>

    <Button
      variant="ghost"
      size="icon"
      onClick={onNext}
      className={`h-12 w-12 md:h-16 md:w-16 rounded-full bg-zinc-800/40 backdrop-blur-xl border border-white/10 transition-all duration-300 ${!hasNext || isLoading ? "opacity-0 -translate-x-4 pointer-events-none" : "opacity-100 translate-x-0 pointer-events-auto hover:bg-zinc-700/60"}`}
    >
      <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white" />
    </Button>
  </div>
)

const LightboxImage = ({
  image,
  imgSrc,
  scale,
  direction,
  setScale,
  onDragSwipe,
  isLoading,
  setIsLoading,
  onBackdropClick // 1. Add this prop
}: {
  image: ImageItem
  imgSrc: string
  scale: number
  direction: number
  setScale: React.Dispatch<React.SetStateAction<number>>
  onDragSwipe: (swipe: number) => void
  isLoading: boolean
  setIsLoading: (val: boolean) => void
  onBackdropClick: (e: React.MouseEvent) => void // 2. Type it
}) => {
  const constraintsRef = useRef<HTMLDivElement>(null)

  const handleDoubleClick = () => setScale((prev) => (prev > 1 ? 1 : 2.5))

  const onDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    { offset, velocity }: PanInfo
  ) => {
    if (scale > 1) return
    onDragSwipe(swipePower(offset.x, velocity.x))
  }

  return (
    <div
      ref={constraintsRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      onClick={onBackdropClick} // 3. Attach it here
    >
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute z-40 pointer-events-none"
          >
            <Loader2 className="w-10 h-10 text-white/70 animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={image.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={polishedTransition}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <motion.img
            src={imgSrc}
            alt={image.fileName}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            animate={{ scale }}
            transition={polishedTransition}
            drag
            dragConstraints={
              scale > 1
                ? constraintsRef
                : { left: 0, right: 0, top: 0, bottom: 0 }
            }
            dragElastic={scale > 1 ? 0.1 : 1}
            onDragEnd={onDragEnd}
            onDoubleClick={handleDoubleClick}
            // 4. Stop the click on the image from closing the lightbox
            onClick={(e) => e.stopPropagation()}
            className={`max-h-[90vh] max-w-[90vw] object-contain shadow-xl rounded-sm will-change-transform pointer-events-auto ${scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export interface ImageLightboxProps {
  data: ImageItem[]
  index: number
  setIndex: (cb: (prev: number) => number) => void
  onClose: () => void
}

export const ImageLightbox = ({
  data,
  index,
  setIndex,
  onClose
}: ImageLightboxProps) => {
  const image = data[index]
  const [isLoading, setIsLoading] = useState(true)
  const [scale, setScale] = useState(1)
  const directionRef = useRef<1 | -1>(1)

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
  }, [index])

  const imgSrc = useMemo(
    () => convertFileSrc(image.filePath || image.thumbnailPath),
    [image.filePath, image.thumbnailPath]
  )

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.5, 4))
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.5, 1))

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) handleZoomIn()
    else handleZoomOut()
  }

  const handleDragSwipe = (swipe: number) => {
    if (swipe < -SWIPE_THRESHOLD && hasNext) paginate(1)
    else if (swipe > SWIPE_THRESHOLD && hasPrev) paginate(-1)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (scale > 1) setScale(1)
      else onClose()
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return

      if (e.key === "ArrowRight" && hasNext) paginate(1)
      if (e.key === "ArrowLeft" && hasPrev) paginate(-1)
      if (e.key === "Escape") {
        if (scale > 1) setScale(1)
        else onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [hasNext, hasPrev, scale, paginate, onClose])

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl select-none"
        onWheel={handleWheel}
        // Removed onClick from here
      >
        <LightboxControls
          image={image}
          scale={scale}
          onZoomIn={handleZoomIn}
          onZoomOut={() => scale > 1 && handleZoomOut()}
          onClose={onClose}
        />

        <LightboxImage
          image={image}
          imgSrc={imgSrc}
          scale={scale}
          direction={directionRef.current}
          setScale={setScale}
          onDragSwipe={handleDragSwipe}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onBackdropClick={handleBackdropClick} // Pass it down here
        />

        {scale === 1 && (
          <LightboxNavigation
            hasPrev={hasPrev}
            hasNext={hasNext}
            isLoading={isLoading}
            onPrev={() => hasPrev && !isLoading && paginate(-1)}
            onNext={() => hasNext && !isLoading && paginate(1)}
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}
