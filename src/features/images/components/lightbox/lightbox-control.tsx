import { X, ZoomIn, ZoomOut } from "lucide-react"

import { Button } from "@/components/ui/button"

export const LightboxControls = ({
  scale,
  onZoomIn,
  onZoomOut,
  onClose
}: {
  scale: number
  onZoomIn: () => void
  onZoomOut: () => void
  onClose: () => void
}) => {
  return (
    <div className="absolute top-0 inset-x-0 h-32 p-4 md:p-6 flex justify-end items-start z-50 pointer-events-none group">
      <div className="flex items-center gap-1 pointer-events-auto bg-black/40 rounded-full p-1 border border-white/10 backdrop-blur-md shadow-xl transition-opacity duration-300 opacity-100 md:opacity-0 group-hover:opacity-100 focus-within:opacity-100">
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
