import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export const LightboxNavigation = ({
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
