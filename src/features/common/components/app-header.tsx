import { cn } from "@/lib/utils"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

import { ImportDialog } from "./import-dialog"
import { HeaderSlot } from "../providers/header-slot-provider"

export const AppHeader = ({ className }: { className?: string }) => {
  const { state, isMobile } = useSidebar()
  return (
    <header
      className={cn(
        "flex h-8 w-full shrink-0 items-center border-b",
        className
      )}
      data-tauri-drag-region
    >
      {(state === "collapsed" || isMobile) && (
        <div className="flex h-full w-35 items-start justify-end transition-all">
          <ImportDialog />
          <SidebarTrigger variant="ghost" />
        </div>
      )}
      <HeaderSlot />
    </header>
  )
}
