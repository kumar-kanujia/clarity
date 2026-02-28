import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { ImportDialog } from "../../components/import -dialog"

export const AppHeader = ({
  className,
  children
}: {
  className?: string
  children?: ReactNode
}) => {
  const { state, isMobile } = useSidebar()
  return (
    <header
      className={cn(
        "border-b flex items-center h-8 w-full shrink-0",
        className
      )}
      data-tauri-drag-region
    >
      {(state === "collapsed" || isMobile) && (
        <div className="w-35 h-full flex items-start justify-end transition-all">
          <ImportDialog />
          <SidebarTrigger variant="ghost" />
        </div>
      )}
      {children}
    </header>
  )
}
