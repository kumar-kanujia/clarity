import { useState, useEffect, type RefObject } from "react"

const getColsFromWidth = (width: number) =>
  width >= 1920
    ? 6
    : width >= 1024
      ? 5
      : width >= 768
        ? 4
        : width >= 480
          ? 3
          : width >= 320
            ? 2
            : 1

export const useContainerCols = (
  ref: RefObject<HTMLElement | null>,
  defaultCols = 4
) => {
  const [cols, setCols] = useState(() => {
    if (typeof window === "undefined") return defaultCols
    return getColsFromWidth(window.innerWidth)
  })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    setCols(getColsFromWidth(element.getBoundingClientRect().width))

    let animationFrameId: number

    const observer = new ResizeObserver((entries) => {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = requestAnimationFrame(() => {
        for (const entry of entries) {
          const newCols = getColsFromWidth(entry.contentRect.width)
          setCols((prev) => (prev !== newCols ? newCols : prev))
        }
      })
    })

    observer.observe(element)

    return () => {
      cancelAnimationFrame(animationFrameId)
      observer.disconnect()
    }
  }, [ref])

  return cols
}
