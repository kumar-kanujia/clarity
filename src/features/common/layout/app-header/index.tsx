import { cn } from "@/lib/utils"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { AddImageButton } from "@/features/images/components/add-image-button"
import type { ReactNode } from "react"

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
          <AddImageButton />
          <SidebarTrigger variant="ghost" />
        </div>
      )}
      {children}
    </header>
  )
}
