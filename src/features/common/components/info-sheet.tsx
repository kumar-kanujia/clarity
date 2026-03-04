import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInfoStore } from "../store"
import { ImageInfoPanel } from "@/features/images/components"

interface InfoSheetShellProps {
  onClose: () => void
  children: React.ReactNode
}

const InfoSheetShell = ({ onClose, children }: InfoSheetShellProps) => (
  <aside className="bg-background hidden h-full w-80 shrink-0 flex-col border-l shadow-sm select-none md:flex">
    <div
      className="flex h-8 items-center justify-end pe-2 pt-3"
      data-tauri-drag-region
    >
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="h-4 w-4" />
        <span className="sr-only">Close sidebar</span>
      </Button>
    </div>
    <div className="flex-1 space-y-6 overflow-y-auto p-4">{children}</div>
  </aside>
)

export const InfoSheet = () => {
  const { state, closeInfoSheet } = useInfoStore()

  if (!state) return null

  return (
    <InfoSheetShell onClose={closeInfoSheet}>
      {state.type === "image" && <ImageInfoPanel image={state.image} />}
    </InfoSheetShell>
  )
}
