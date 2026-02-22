import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import { AnimatePresence, motion } from "motion/react"
import { convertFileSrc } from "@tauri-apps/api/core"

import type { ImageItem } from "@/services/tauri"
import { LightboxControls } from "./lightbox-control"
import { LightboxImage } from "./lightbox-image"
import { LightboxNavigation } from "./lightbox-navigation"

const SWIPE_THRESHOLD = 10000

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
