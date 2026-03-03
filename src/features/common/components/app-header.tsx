import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { ImportDialog } from "./import-dialog"

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
      {children}
    </header>
  )
}
