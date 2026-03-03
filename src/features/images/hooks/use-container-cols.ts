import { useState, useEffect, type RefObject } from "react"

export const useContainerCols = (
  ref: RefObject<HTMLElement | null>,
  defaultCols = 4
) => {
  const [cols, setCols] = useState(defaultCols)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let animationFrameId: number

    const observer = new ResizeObserver((entries) => {
      cancelAnimationFrame(animationFrameId)

      animationFrameId = requestAnimationFrame(() => {
        for (let entry of entries) {
          const width = entry.contentRect.width

          let newCols = 1
          if (width >= 1920) newCols = 5
          else if (width >= 1024) newCols = 4
          else if (width >= 768) newCols = 3
          else if (width >= 480) newCols = 2
          setCols((prevCols) => (prevCols !== newCols ? newCols : prevCols))
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
