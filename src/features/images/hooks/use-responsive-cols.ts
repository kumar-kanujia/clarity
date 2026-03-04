import { useState, useEffect } from "react"

export const useResponsiveCols = (defaultCols = 4) => {
  const [cols, setCols] = useState(defaultCols)

  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth >= 1920) setCols(5)
      else if (window.innerWidth >= 1024) setCols(4)
      else if (window.innerWidth >= 768) setCols(3)
      else if (window.innerWidth >= 480) setCols(2)
      else setCols(1)
    }

    updateCols()
    window.addEventListener("resize", updateCols)
    return () => window.removeEventListener("resize", updateCols)
  }, [])

  return cols
}
