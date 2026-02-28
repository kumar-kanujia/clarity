import { useRef } from "react"
import { Loader2 } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import type { PanInfo, Transition } from "motion/react"
import type { ImageItem } from "@/tauri"

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

export const LightboxImage = ({
  image,
  imgSrc,
  scale,
  direction,
  setScale,
  onDragSwipe,
  isLoading,
  setIsLoading,
  onBackdropClick
}: {
  image: ImageItem
  imgSrc: string
  scale: number
  direction: number
  setScale: React.Dispatch<React.SetStateAction<number>>
  onDragSwipe: (swipe: number) => void
  isLoading: boolean
  setIsLoading: (val: boolean) => void
  onBackdropClick: (e: React.MouseEvent) => void
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
      onClick={onBackdropClick}
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
            onClick={(e) => e.stopPropagation()}
            className={`max-h-[90vh] max-w-[90vw] object-contain shadow-xl rounded-sm will-change-transform pointer-events-auto ${scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
